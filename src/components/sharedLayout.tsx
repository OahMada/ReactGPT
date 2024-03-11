import { NavLink, useSearchParams, useSubmit, useLocation, Outlet } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { useForm } from 'react-hook-form';
import { useRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { IconContext } from 'react-icons';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectArticle, unPinArticle, pinArticle } from '../features/articleSlice';
import { performFuseSearch, useKeys, HotkeyMapData, useNavigateWithSearchParams } from '../utils';
import { ArticleCard } from '.';

interface SearchForm {
	search: string;
}

export var SharedLayout = () => {
	let [searchFocus, setSearchFocus] = useState(false);
	let articlePinningScheduleRef = useRef<Map<string, 'pin' | 'unpin'>>(new Map());
	let debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
	let newArticleLinkRef = useRef<HTMLAnchorElement>(null);

	let dispatch = useAppDispatch();
	let { articleQueue, paragraphs } = useAppSelector(selectArticle);

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
			.sort((a, b) => b.editDate - a.editDate), // put the newly created article in the first place
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
			{(query || articles.length > 0) && ( // same as !(!query && articles.length < 1), means no articles have been created
				<StyledAside>
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
						<div className='card'>
							<div
								className='link-wrapper'
								onClick={() => {
									if (!newArticleLinkRef.current) throw Error('newArticleLinkRef is not assigned');
									newArticleLinkRef.current.click();
								}}
							>
								<NavLink
									to={`/${query ? `?search=${query}` : ''}`}
									data-tooltip-id='hotkey'
									data-tooltip-content={articlePageHotkeys.createNewArticle.label}
									ref={newArticleLinkRef}
								>
									New Article
								</NavLink>
							</div>
						</div>
						{articles.length < 1 && (
							<div className='card'>
								<p>No articles match the search query.</p>
							</div>
						)}
						{articles.map((article) => {
							return (
								<IconContext.Provider value={{ size: '1.6rem' }}>
									<ArticleCard
										key={article.articleId}
										article={article}
										articleIsInFavorites={articleIsInFavorites(article.articleId)}
										articlePinningScheduleRef={articlePinningScheduleRef.current}
									/>
								</IconContext.Provider>
							);
						})}
					</div>
				</StyledAside>
			)}
			<Outlet />
		</>
	);
};

var StyledAside = styled.aside`
	position: sticky;
	top: 100px;
	width: 250px;
	max-height: calc(100dvh - var(--header-height));
	flex-shrink: 0;
	margin-top: var(--header-offset);
	margin-right: var(--gap-big);
	font-size: var(--font-small);

	form {
		padding: 10px 0;
		font-size: var(--font-primary);

		input {
			display: inline-block;
			padding: 5px;
		}
	}

	.card-wrapper {
		display: flex;
		max-height: calc(100dvh - 2 * min(70rem, 100px) - 50px);
		flex-direction: column;
		padding-right: 15px;
		gap: var(--gap-primary);
		overflow-y: scroll;

		.card {
			position: relative;
			display: flex;
			overflow: hidden;
			width: 100%;
			height: 9.5rem;
			flex-shrink: 0;
			align-items: center;
			justify-content: flex-start;
			padding: 5px;
			border: 1px solid var(--color-dark);
			border-radius: var(--border-radius);
			gap: var(--gap-primary);

			/* without this, the box shadow on the last card won't show up */
			&:last-child {
				margin-bottom: 20px;
			}

			& .link-wrapper {
				display: grid;
				width: 100%;
				height: 100%;
				place-items: center;

				&:hover {
					color: var(--color-darkest);
				}

				a {
					display: inline-block;
					color: inherit;
					font-size: var(--font-big);
					text-decoration: none;
				}
			}

			& > p {
				padding: 10px;
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
