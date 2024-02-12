import { NavLink, useNavigate, useSearchParams, useSubmit, useLocation } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { useForm } from 'react-hook-form';
import { useRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectArticle, unPinArticle, pinArticle } from '../features/articleSlice';
import { performFuseSearch, useKeys, HotkeyMapData, useNavigateWithSearchParams } from '../utils';
import { ArticleCard } from '../components';

interface SearchForm {
	search: string;
}

export var SharedLayout = () => {
	let [searchFocus, setSearchFocus] = useState(false);
	let articlePinningScheduleRef = useRef<Map<string, 'pin' | 'unpin'>>(new Map());
	let debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

	let dispatch = useAppDispatch();
	let { articleQueue, paragraphs } = useAppSelector(selectArticle);

	let navigate = useNavigate();
	let submit = useSubmit();
	let location = useLocation();
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

	let resolveArticlePinningSchedules = () => {
		for (let entry of articlePinningScheduleRef.current) {
			// article can be deleted during the process
			if ([...articleQueue.favorites, ...articleQueue.normal].includes(entry[0])) {
				if (entry[1] === 'pin') {
					dispatch(pinArticle(entry[0]));
				} else {
					dispatch(unPinArticle(entry[0]));
				}
			}
		}
		articlePinningScheduleRef.current.clear();
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
							onFocus={() => setSearchFocus(true)}
							onBlur={() => setSearchFocus(false)}
							data-tooltip-hidden={searchFocus}
						/>
					</form>
				)}
				<div
					className='card-wrapper'
					onMouseLeave={() => {
						debounceTimeoutRef.current = setTimeout(() => {
							resolveArticlePinningSchedules();
						}, 500);
					}}
					onMouseEnter={() => {
						window.clearTimeout(debounceTimeoutRef.current);
					}}
				>
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
					{articles.map((article, index) => {
						if (!/articles$/.test(location.pathname) && index > 4) {
							return;
						}
						return (
							<ArticleCard
								key={article.articleId}
								article={article}
								articleIsInFavorites={articleIsInFavorites(article.articleId)}
								articlePinningScheduleRef={articlePinningScheduleRef.current}
							/>
						);
					})}
					{articles.length > 5 && !/articles$/.test(location.pathname) && (
						<div className='card'>
							<div className='link-wrapper'>
								<NavLink to={`/articles${query ? `?search=${query}` : ''}`}>More...</NavLink>
							</div>
						</div>
					)}
				</div>
			</StyledNav>
			{/articles$/.test(location.pathname) && (
				<div>
					<button
						className='btn'
						onClick={() => {
							navigate(-1);
						}}
					>
						Back
					</button>
				</div>
			)}
		</>
	);
};

var StyledHeader = styled.header`
	display: flex;
	justify-content: flex-end;
	gap: 0.8rem;
	grid-column: 1 / span 12;
`;

var StyledNav = styled.nav`
	font-size: var(--font-small);
	grid-column: 1 / span 12;

	form {
		padding: 1rem 0;
		font-size: var(--font-primary);

		input {
			display: inline-block;
			padding: 0.5rem;
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
		}

		.card.active:not(:first-child) {
			box-shadow: 0 1rem 1rem rgb(0 0 0 / 10%);
			transform: translateY(-1px);
		}
	}
`;
