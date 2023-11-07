import { Outlet, NavLink, useNavigate, useParams, useSearchParams, useSubmit, useLocation, createSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'react-use';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, removeArticle, addArticleToDeletionQueue } from '../features/articleSlice';
import { performFuseSearch } from '../utils';

interface SearchForm {
	search: string;
}

export default function Root() {
	let dispatch = useAppDispatch();
	let { articleQueue, paragraphs } = useAppSelector(selectArticle);

	let navigate = useNavigate();
	let submit = useSubmit();
	let location = useLocation();

	const { articleId: currentArticle } = useParams();
	let [searchParams] = useSearchParams();
	let query = searchParams.get('search');

	// preserve the search on page refresh
	let [localQuery, setLocalQuery] = useLocalStorage('query', '');
	let { register } = useForm<SearchForm>({
		defaultValues: {
			search: localQuery ?? '',
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

	// build articles array and run filters on it
	let articles = articleQueue.map((articleId) => {
		return { articleId, articleText: buildArticle(articleId) };
	});

	// filter articles based on search params
	if (query) {
		articles = performFuseSearch(articles, query);
	}

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

	return (
		<>
			<div>
				<form role='search'>
					<input
						aria-label='Search articles'
						type='search'
						placeholder='Search'
						{...register('search', {
							onChange: (e) => {
								setLocalQuery(e.target.value);

								// use location.pathname to add search params on the same location
								submit(e.currentTarget.form, { method: 'get', action: location.pathname });
							},
						})}
					/>
				</form>
				<NavLink to='/'>New Article</NavLink>
			</div>
			<nav>
				<ul>
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
											dispatch(removeArticle({ articleId: article.articleId, mode: 'explicit' }));
											// only navigate when the displaying article is deleted
											if (article.articleId === currentArticle) {
												navigate('/');
											}
										}}
									>
										Delete
									</button>
									<button>Pin</button>
								</div>
							</li>
						);
					})}
				</ul>
			</nav>
			<StyledSection id='detail'>
				<Outlet />
			</StyledSection>
		</>
	);
}

var StyledSection = styled.section`
	border: 1px solid #ccc;
	padding: 6rem;
	width: 100%;
	height: 80vh;
	position: relative;
`;

// TODO active css effect
