import { Outlet, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch } from '../app/hooks';
import { useForm, SubmitHandler } from 'react-hook-form';

import { useAppSelector } from '../app/hooks';
import { selectArticle, removeArticle, addArticleToDeletionQueue } from '../features/articleSlice';

interface SearchForm {
	search: string;
}

export default function Root() {
	let dispatch = useAppDispatch();
	let navigate = useNavigate();
	const { articleId: currentArticle } = useParams();
	let { register, handleSubmit } = useForm<SearchForm>(); // https://react-hook-form.com/ts#SubmitHandler
	let [searchParams, setSearchParams] = useSearchParams();

	console.log(searchParams.get('search'));

	let { articleQueue, paragraphs } = useAppSelector(selectArticle);

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
	// TODO filter articles based on search params

	let onSubmit: SubmitHandler<SearchForm> = (data) => {
		setSearchParams({ search: data.search });
	};

	return (
		<>
			<div>
				<form role='search' onSubmit={handleSubmit(onSubmit)}>
					<input aria-label='Search articles' type='search' placeholder='Search' {...register('search')} />
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
