import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { useQueryClient } from '@tanstack/react-query';
import { gptKeys, queryGPT } from '../query/GPT';

import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, handleParagraphOrderChange, Paragraph as ParagraphType } from '../features/article/articleSlice';

import UserInput from './userInput';
import Paragraph from './paragraph';
import ParagraphControlBtns from './paragraphControlBtns';

import styles from './articleDisplay.module.css';

interface FallbackComponentTypes {
	props: FallbackProps;
	paragraphText: string;
}

var FallbackComponent = ({ props: { error, resetErrorBoundary }, paragraphText }: FallbackComponentTypes) => {
	return (
		<>
			<p>{paragraphText}</p>
			<p>{error.message}</p>
			<button onClick={() => resetErrorBoundary()}>Retry</button>
		</>
	);
};

export var ArticleDisplay = () => {
	let QueryClient = useQueryClient();

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
				<ErrorBoundary
					FallbackComponent={(props) => <FallbackComponent {...{ props }} paragraphText={paragraph.paragraphBeforeGrammarFix} />}
					onReset={() => {
						// handle network error
						QueryClient.ensureQueryData({ queryKey: gptKeys(paragraph.paragraphBeforeGrammarFix), queryFn: queryGPT });
					}}
					onError={(error) => console.log(error)}
				>
					<Paragraph paragraph={paragraph} />
					<ParagraphControlBtns paragraphId={paragraph.id} />
				</ErrorBoundary>
			</div>
		);
	});
};
