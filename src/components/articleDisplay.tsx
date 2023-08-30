import { useAppSelector } from '../app/hooks';
import { selectArticle } from '../features/article/articleSlice';

import UserInput from './userInput';
import Paragraph from './paragraph';
import ParagraphControlBtns from './paragraphControlBtns';

import styles from './articleDisplay.module.css';

export var ArticleDisplay = () => {
	// state values
	let article = useAppSelector(selectArticle);

	if (article.status === 'acceptingUserInput') {
		return <UserInput />;
	}

	return article.paragraphs.map((paragraph, index) => {
		return (
			<div className={styles.paragraph} key={paragraph.id}>
				<Paragraph paragraph={paragraph} />
				<ParagraphControlBtns paragraphId={paragraph.id} />
			</div>
		);
	});
};
