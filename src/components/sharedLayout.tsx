import { NavLink, useSearchParams, useSubmit, useLocation, Outlet } from 'react-router-dom';
import { useLocalStorage, useWindowSize } from 'react-use';
import { useForm } from 'react-hook-form';
import { useRef, useImperativeHandle, useState, useEffect } from 'react';
import styled from 'styled-components';
import { RiArrowDropRightLine, RiArrowDropDownLine } from 'react-icons/ri';
import { lock, unlock } from 'tua-body-scroll-lock';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectArticle, unPinArticle, pinArticle } from '../features/articleSlice';
import { performFuseSearch, useKeys, HotkeyMapData, useNavigateWithSearchParams } from '../utils';
import { ArticleCard, useIntersectionContext } from '.';
import { Button } from '../styled/button';

interface SearchForm {
	search: string;
}

export var SharedLayout = () => {
	let { shouldConstrainHeightRef } = useIntersectionContext();
	let { width: windowWidth } = useWindowSize();
	let [showMenu, setShowMenu] = useState(false);
	let [searchFocus, setSearchFocus] = useState(false);
	let articlePinningScheduleRef = useRef<Map<string, 'pin' | 'unpin'>>(new Map());
	let debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
	let newArticleLinkRef = useRef<HTMLAnchorElement>(null);
	let articleCardWrapperRef = useRef(null);

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

	// disable body scroll underneath
	useEffect(() => {
		if (showMenu) {
			lock(articleCardWrapperRef.current);
		}
		return () => unlock(articleCardWrapperRef.current);
	}, [showMenu]);

	return (
		<>
			{(query || articles.length > 0) && ( // same as !(!query && articles.length < 1), means no articles have been created
				<>
					{windowWidth <= 750 && (
						<MenuBtn className='menu-btn' onClick={() => setShowMenu(!showMenu)} $showMenu={showMenu}>
							<span>Articles</span>
							{showMenu ? <RiArrowDropDownLine /> : <RiArrowDropRightLine />}
						</MenuBtn>
					)}
					<StyledAside $showMenu={showMenu} $shouldConstrainHeight={shouldConstrainHeightRef.current}>
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
							ref={articleCardWrapperRef}
						>
							<div className='card'>
								<div
									className='link-wrapper'
									onClick={() => {
										if (!newArticleLinkRef.current) throw Error('newArticleLinkRef is not assigned');
										newArticleLinkRef.current.click();
										setShowMenu(false);
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
									<ArticleCard
										key={article.articleId}
										article={article}
										articleIsInFavorites={articleIsInFavorites(article.articleId)}
										articlePinningScheduleRef={articlePinningScheduleRef.current}
										setShowMenu={setShowMenu}
									/>
								);
							})}
						</div>
					</StyledAside>
				</>
			)}
			<Outlet />
		</>
	);
};

var MenuBtn = styled(Button)<{ $showMenu: boolean }>`
	position: fixed;
	z-index: 1;
	top: calc((var(--header-height) - var(--util-icon-container-dimension)) / 2);
	left: var(--root-padding);
	display: inline-block;
	display: flex;
	align-items: center;
	color: ${({ $showMenu }) => ($showMenu ? 'var(--color-darkest)' : 'inherit')};
`;

var StyledAside = styled.aside<{ $showMenu: boolean; $shouldConstrainHeight: boolean }>`
	position: sticky;
	top: 100px;
	width: 250px;
	height: ${({ $shouldConstrainHeight }) =>
		$shouldConstrainHeight ? 'calc(100dvh - var(--header-offset) - var(--header-height))' : 'calc(100dvh - var(--header-offset) - 15px)'};
	flex-shrink: 0;
	margin-top: var(--header-offset);
	margin-right: var(--gap-big);
	font-size: var(--font-small);

	@media (width <= 46.875rem) {
		position: fixed;
		z-index: 1;
		top: 0;
		display: ${({ $showMenu }) => ($showMenu ? 'block' : 'none')};
		width: 100%;
		height: calc(100dvh - var(--header-height));
		padding: 0 var(--root-padding);
		padding-top: 10px;
		margin-top: var(--header-height);
		margin-right: 0;
		background-color: white;
	}

	form {
		padding: 10px 0;
		font-size: var(--font-primary);

		input {
			display: inline-block;
			height: var(--util-icon-container-dimension);
			padding: 5px;
		}
	}

	.card-wrapper {
		display: flex;
		overflow: auto;
		max-height: calc(100% - var(--util-icon-container-dimension) - 20px);
		flex-direction: column;
		padding-right: 15px;
		gap: var(--gap-big);
		scrollbar-gutter: stable;
		scrollbar-width: thin;

		@media (width <= 46.875rem) {
			display: grid;
			max-height: calc(100dvh - var(--header-height) - 8rem);
			padding-top: 5px;
			padding-right: 0;
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		}

		.card {
			position: relative;
			display: flex;
			overflow: hidden;
			height: 9.5rem;
			flex-shrink: 0;
			align-items: center;
			justify-content: flex-start;
			padding: 5px;
			border: 1px solid var(--color-dark);
			border-radius: var(--border-radius);
			gap: var(--gap-primary);

			@media (width <= 46.875rem) {
				padding-right: 10px;
			}

			/* without this, the box shadow on the last card won't show up */
			&:last-child {
				margin-bottom: 10px;
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
			}
		}

		.card.active:not(:first-child) {
			box-shadow: 0 0.5rem 0.5rem rgb(0 0 0 / 10%);
			transform: translateY(-1px);
		}
	}
`;
