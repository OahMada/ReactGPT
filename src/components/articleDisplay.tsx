import { useAppSelector } from '../app/hooks';

import { selectArticle } from '../features/article/articleSlice';

import UserInput from './userInput';
import Paragraph from './paragraph';

export var ArticleDisplay = () => {
	// state values
	let article = useAppSelector(selectArticle);

	if (article.status === 'acceptingUserInput') {
		return <UserInput />;
	}

	return article.paragraphs.map((paragraph) => {
		return <Paragraph paragraph={paragraph} key={paragraph.id} />;
	});
};
