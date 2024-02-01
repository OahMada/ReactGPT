import { NavLink, useNavigate, useParams, useSearchParams, useSubmit, useLocation } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { useForm } from 'react-hook-form';
import { useRef, useImperativeHandle } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
	selectArticle,
	removeArticle,
	addArticleToDeletionQueue,
	unPinArticle,
	pinArticle,
	removeArticleFromDeletionQueue,
} from '../features/articleSlice';
import { performFuseSearch, useKeys, HotkeyMapData, useNavigateWithSearchParams } from '../utils';

interface SearchForm {
	search: string;
}

export var SharedLayout = () => {
	dayjs.locale('zh-cn');
	let dispatch = useAppDispatch();
	let { articleQueue, paragraphs } = useAppSelector(selectArticle);

	let navigate = useNavigate();
	let submit = useSubmit();
	let location = useLocation();
	const { articleId: currentArticle } = useParams();
	let [searchParams] = useSearchParams();
	let navigateWithSearchParams = useNavigateWithSearchParams();

	let query = searchParams.get('search');

	let [localQuery, setLocalQuery] = useLocalStorage('query', '');
	let { register, handleSubmit } = useForm<SearchForm>({
		values: { search: query ?? '' }, // clear input after clicking back button
		defaultValues: {
			search: localQuery ?? '', // preserve the search on page refresh
		},
	}); // https://react-hook-form.com/ts#SubmitHandler

	let { ref, ...rest } = register('search', {
		onChange: (e) => {
			setLocalQuery(e.target.value);
			// use location.pathname to add search params to the same url
			let isFirstSearch = query == null;
			submit(e.currentTarget.form, {
				method: 'get',
				action: location.pathname,
				replace: !isFirstSearch,
			});
		},
	});

	let buildArticle = (articleId: string) => {
		return paragraphs.reduce<string>((acc, cur) => {
			if (cur.articleId === articleId) {
				if (cur.paragraphAfterGrammarFix) {
					acc += cur.paragraphAfterGrammarFix;
				} else {
					acc += cur.paragraphBeforeGrammarFix;
				}
				acc += ' ';
			}
			return acc;
		}, '');
	};

	let buildArticleEditDate = (articleId: string) => {
		return paragraphs.reduce<number>((acc, cur) => {
			if (cur.articleId === articleId) {
				if (cur.editDate > acc) {
					acc = cur.editDate;
				}
			}
			return acc;
		}, 0);
	};

	// build articles array and run filters on it
	let articles = [
		...articleQueue.favorites
			.map((articleId) => {
				return { articleId, articleText: buildArticle(articleId), editDate: buildArticleEditDate(articleId) };
			})
			.sort((a, b) => b.editDate - a.editDate),
		...articleQueue.normal
			.map((articleId) => {
				return { articleId, articleText: buildArticle(articleId), editDate: buildArticleEditDate(articleId) };
			})
			.sort((a, b) => b.editDate - a.editDate),
	];

	// filter articles based on search params
	if (query) {
		articles = performFuseSearch(articles, query);
	}

	// do nothing on form submission, prevent pressing enter key and reloading page, instead submit on content change
	let onSubmit = () => {};

	let articleIsInFavorites = (articleId: string) => {
		return articleQueue.favorites.indexOf(articleId) !== -1 ? true : false;
	};

	let handleClickConfigBtn = () => {
		navigate('/config');
	};
	let handleClickHotkeyMapBtn = () => {
		navigate('/hotkey');
	};

	let { 'Article Page': articlePageHotkeys } = HotkeyMapData();

	// hotkey for entering new article page
	/* v8 ignore next 7 */
	useKeys({
		keyBinding: articlePageHotkeys.createNewArticle.hotkey,
		callback: () => {
			navigateWithSearchParams('/');
		},
		enabled: !/preview$/.test(location.pathname),
	});

	// hotkey for entering config page
	useKeys({
		keyBinding: articlePageHotkeys.enterConfig.hotkey,
		callback: handleClickConfigBtn,
	});

	// hotkey for entering hotkey map page
	useKeys({
		keyBinding: articlePageHotkeys.enterHotkeyMap.hotkey,
		callback: handleClickHotkeyMapBtn,
	});

	let searchInputRef = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => searchInputRef.current);

	// hotkey for focusing search field
	/* v8 ignore next 6 */
	useKeys({
		keyBinding: articlePageHotkeys.enableSearch.hotkey,
		callback: () => {
			searchInputRef.current!.focus();
		},
	});

	return (
		<>
			<StyledHeader>
				<button onClick={handleClickConfigBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterConfig.label} className='btn'>
					Config
				</button>
				<button
					onClick={handleClickHotkeyMapBtn}
					data-tooltip-id='hotkey'
					data-tooltip-content={articlePageHotkeys.enterHotkeyMap.label}
					className='btn'
				>
					Hotkey Map
				</button>
			</StyledHeader>
			<StyledNav>
				{(query || articles.length > 0) && ( // same as !(!query && articles.length < 1), means no articles have been created
					<form role='search' onSubmit={handleSubmit(onSubmit)}>
						<input
							aria-label='Search articles'
							type='search'
							placeholder='Search'
							ref={searchInputRef}
							{...rest}
							data-tooltip-id='hotkey'
							data-tooltip-content={articlePageHotkeys.enableSearch.label}
						/>
					</form>
				)}
				<div className='card-wrapper'>
					{(query || articles.length > 0) && (
						<div className='card'>
							<div className='link-wrapper'>
								<NavLink
									to={`/${query ? `?search=${query}` : ''}`}
									data-tooltip-id='hotkey'
									data-tooltip-content={articlePageHotkeys.createNewArticle.label}
								>
									New Article
								</NavLink>
							</div>
						</div>
					)}
					{query && articles.length < 1 && (
						<div className='card'>
							<p>No articles match the search query.</p>
						</div>
					)}
					{articles.map((article) => {
						return (
							<div key={article.articleId} className='card'>
								{/* need border for this*/}
								<div onClick={() => navigateWithSearchParams(`article/${article.articleId}`)} className='card-content'>
									<p>{article.articleText.length > 40 ? article.articleText.slice(0, 40) + '...' : article.articleText}</p>{' '}
									{/* since paragraph role is not supported yet in RTL */}
									<p className='date'>{dayjs(article.editDate).format('YYYY-MM-DD THH:mm')}</p>
								</div>
								<div className='btn-container'>
									{/* TODO hover to show */}
									<button
										onClick={() => {
											dispatch(addArticleToDeletionQueue(article.articleId));
											dispatch(removeArticle(article.articleId));
											// only navigate when the displaying article is deleted
											if (article.articleId === currentArticle) {
												navigate('/');
											}
											dispatch(removeArticleFromDeletionQueue(article.articleId));
											toast.dismiss(`articleDeletion${article.articleId}`);
										}}
										className='btn'
									>
										Delete
									</button>
									{articleIsInFavorites(article.articleId) ? (
										<button
											onClick={() => {
												dispatch(unPinArticle(article.articleId));
											}}
											className='btn'
										>
											Unpin
										</button>
									) : (
										<button
											onClick={() => {
												dispatch(pinArticle(article.articleId));
											}}
											className='btn'
										>
											Pin
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</StyledNav>
		</>
	);
};

var StyledHeader = styled.header`
	display: flex;
	justify-content: flex-end;
	gap: 0.8rem;
`;

var StyledNav = styled.nav`
	font-size: var(--font-small);

	form {
		padding: 1rem 0;
		font-size: var(--font-primary);

		input {
			display: inline-block;
			padding: 0.5rem;
			font-size: var(--font-primary);
		}
	}

	.card-wrapper {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));

		.card {
			position: relative;
			display: flex;
			overflow: hidden;
			width: 100%;
			height: 10rem;
			align-items: center;
			justify-content: flex-start;
			padding: 0.5rem;
			border: 1px solid var(--color-dark);
			border-radius: 0.5rem;
			gap: 0.5rem;

			& .link-wrapper {
				display: grid;
				width: 100%;
				place-items: center;

				a {
					display: inline-block;
					color: black;
					font-size: var(--font-big);
					font-weight: lighter;
					text-decoration: none;

					&:hover {
						color: var(--color-dark);
					}
				}
			}

			& > p {
				padding: 1rem;
				color: black;
				font-size: var(--font-big);
				font-weight: lighter;
			}

			.btn-container {
				position: absolute;
				right: 0;
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
				opacity: 0;
				transition:
					translate 0.5s,
					opacity 0.5s;
				translate: 100%;

				.btn {
					border: none;
					border-radius: 1rem;
				}
			}

			&:hover .btn-container {
				position: static;
				opacity: 1;
				translate: none;
			}
		}

		.card-content {
			display: flex;
			height: 100%;
			flex: 1 1 auto;
			flex-direction: column;
			justify-content: space-between;
		}

		.date {
			color: grey;
			font-style: italic;
		}
	}
`;
