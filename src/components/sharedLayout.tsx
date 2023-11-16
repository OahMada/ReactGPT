import { NavLink, useNavigate, useParams, useSearchParams, useSubmit, useLocation, createSearchParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { useForm } from 'react-hook-form';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
	selectArticle,
	removeArticle,
	addArticleToDeletionQueue,
	unPinArticle,
	pinArticle,
	removeArticleFromDeletionQueue,
} from '../features/articleSlice';
import { performFuseSearch } from '../utils';

interface SearchForm {
	search: string;
}

export var SharedLayout = () => {
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

	let combinedArticleQueue = [...articleQueue.favorites, ...articleQueue.normal];

	// build articles array and run filters on it
	let articles = combinedArticleQueue.map((articleId) => {
		return { articleId, articleText: buildArticle(articleId) };
	});

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

	return (
		<>
			<div>
				<button onClick={() => navigate('/config')}>CONFIG</button>
				<form role='search' onSubmit={handleSubmit(onSubmit)}>
					<input
						aria-label='Search articles'
						type='search'
						placeholder='Search'
						{...register('search', {
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
						})}
					/>
				</form>
			</div>
			<nav>
				<ul>
					<NavLink to='/'>New Article</NavLink>
					{articles.map((article) => {
						return (
							<li key={article.articleId}>
								{/* need border for this*/}
								<div onClick={() => handleNavigate(`article/${article.articleId}`)}>
									<p>{article.articleText.slice(0, 20)}</p>
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
										}}
									>
										Delete
									</button>
									{articleIsInFavorites(article.articleId) ? (
										<button
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
