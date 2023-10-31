import { Outlet, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

import { selectArticle } from '../features/articleSlice';

export default function Root() {
	let { articlesQueue, paragraphs } = useAppSelector(selectArticle);

	let buildArticle = (articleId: string) => {
		return paragraphs.reduce<string>((acc, cur) => {
			if (cur.articleId === articleId) {
				if (cur.paragraphBeforeGrammarFix) {
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
						<Link to='/'>New Article</Link>
					</li>
					{articlesQueue.map((articleId) => {
						return (
							<li key={articleId}>
								<Link to={`article/${articleId}`}>{buildArticle(articleId).slice(0, 20)}</Link>
							</li>
						);
					})}
				</ul>
			</nav>
			<div id='detail'>
				<Outlet />
			</div>
		</>
	);
}
