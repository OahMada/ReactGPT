import { NavLink, useNavigate, useParams, useSearchParams, useSubmit, useLocation, createSearchParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { useForm } from 'react-hook-form';
import { useRef, useImperativeHandle } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale
import { toast } from 'react-toastify';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
	selectArticle,
	removeArticle,
	addArticleToDeletionQueue,
	unPinArticle,
	pinArticle,
	removeArticleFromDeletionQueue,
} from '../features/articleSlice';
import { performFuseSearch, useKeys, HotkeyMapData } from '../utils';

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

	let handleNavigate = (path: string) => {
		// https://stackoverflow.com/questions/65800658/react-router-v6-navigate-to-a-url-with-searchparams
		if (query) {
			navigate({
				pathname: path,
				search: `?${createSearchParams({
					search: query,
				})}`,
			});
		} else {
			navigate(path);
		}
	};

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
			navigate('/');
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
			<div>
				<button onClick={handleClickConfigBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterConfig.label}>
					CONFIG
				</button>
				<button onClick={handleClickHotkeyMapBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterHotkeyMap.label}>
					Hotkey Map
				</button>
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
			</div>
			<nav>
				<ul>
					<NavLink to='/' data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.createNewArticle.label}>
						New Article
					</NavLink>
					{articles.map((article) => {
						return (
							<li key={article.articleId}>
								{/* need border for this*/}
								<div onClick={() => handleNavigate(`article/${article.articleId}`)}>
									<p>{article.articleText.slice(0, 20)}</p> {/* since paragraph role is not supported yet in RTL */}
									<p>{dayjs(article.editDate).format('YYYY-MM-DD THH:mm')}</p>
								</div>
								<div>
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
									>
										Delete
									</button>
									{articleIsInFavorites(article.articleId) ? (
										<button
											/* v8 ignore next 3 */
											onClick={() => {
												dispatch(unPinArticle(article.articleId));
											}}
										>
											Unpin
										</button>
									) : (
										<button
											onClick={() => {
												dispatch(pinArticle(article.articleId));
											}}
										>
											Pin
										</button>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			</nav>
		</>
	);
};
