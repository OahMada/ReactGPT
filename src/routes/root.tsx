import { Outlet, NavLink, useNavigate, useParams, useSearchParams, useSubmit, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'react-use';
import { useForm, SubmitHandler } from 'react-hook-form';
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
	console.log(location);

	const { articleId: currentArticle } = useParams();
	let [searchParams, setSearchParams] = useSearchParams();
	let query = searchParams.get('search');

	// preserve the search on page refresh
	let [localQuery, setLocalQuery] = useLocalStorage('query', '');
	let { register, handleSubmit, watch } = useForm<SearchForm>({
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

	let onSubmit: SubmitHandler<SearchForm> = (data) => {
		setSearchParams({ search: data.search });
	};

	// https://stackoverflow.com/questions/63466463/how-to-submit-react-form-fields-on-onchange-rather-than-on-submit-using-react-ho
	// useEffect(() => {
	// 	let subscription = watch(() => handleSubmit(onSubmit)());
	// 	return () => subscription.unsubscribe();
	// }, [handleSubmit, watch]);

	return (
		<>
			<div>
				<form role='search' onSubmit={handleSubmit(onSubmit)}>
					<input
						aria-label='Search articles'
						type='search'
						placeholder='Search'
						{...register('search', {
							onChange: (e) => {
								setLocalQuery(e.target.value);
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
								<NavLink to={`article/${article.articleId}`}>{article.articleText.slice(0, 20)}</NavLink>
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
