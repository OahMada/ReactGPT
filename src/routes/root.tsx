import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch } from '../app/hooks';

import { useAppSelector } from '../app/hooks';
import { selectArticle, removeArticle, addArticleToDeletionQueue } from '../features/articleSlice';

export default function Root() {
	let dispatch = useAppDispatch();
	let navigate = useNavigate();
	const { articleId: currentArticle } = useParams();

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

	return (
		<>
			<nav>
				<ul>
					<li>
						<NavLink to='/'>New Article</NavLink>
					</li>
					{articleQueue.map((articleId) => {
						return (
							<li key={articleId}>
								<NavLink to={`article/${articleId}`}>{buildArticle(articleId).slice(0, 20)}</NavLink>
								<div>
									{/* TODO hover to show */}
									<button
										onClick={() => {
											dispatch(addArticleToDeletionQueue(articleId));
											dispatch(removeArticle({ articleId, mode: 'explicit' }));
											// only navigate when the displaying article is deleted
											if (articleId === currentArticle) {
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
