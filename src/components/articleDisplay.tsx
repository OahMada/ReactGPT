import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, handleParagraphOrderChange, Paragraph as ParagraphType } from '../features/article/articleSlice';

import UserInput from './userInput';
import Paragraph from './paragraph';
import ParagraphControlBtns from './paragraphControlBtns';

import styles from './articleDisplay.module.css';

export var ArticleDisplay = () => {
	// state values
	let article = useAppSelector(selectArticle);
	let dispatch = useAppDispatch();

	let handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.dataTransfer.setData('ReactGpt/paragraph', e.currentTarget.id);
		e.dataTransfer.effectAllowed = 'move';
	};
	let handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		let dropTargetId = e.currentTarget.id;
		let dragTargetId = e.dataTransfer.getData('ReactGpt/paragraph');
		dispatch(handleParagraphOrderChange({ dragTargetId, dropTargetId }));
	};

	if (article.status === 'acceptingUserInput') {
		return <UserInput />;
	}

	return article.paragraphs.map((paragraph: ParagraphType) => {
		return (
			<div
				className={styles.paragraph}
				key={paragraph.id}
				draggable
				id={paragraph.id}
				onDragOver={(ev) => ev.preventDefault()}
				onDragStart={handleDrag}
				onDrop={handleDrop}
			>
				<Paragraph paragraph={paragraph} />
				<ParagraphControlBtns paragraphId={paragraph.id} />
			</div>
		);
	});
};
