import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { createToast } from '../utils';
import styled from 'styled-components';

// query
import { useQueryClient } from '@tanstack/react-query';
import { gptKeys, queryGPT } from '../query/GPT';

// redux
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, handleParagraphOrderChange, Paragraph as ParagraphType } from '../features/articleSlice';

import UserInput from './userInput';
import Paragraph from './paragraph';
import ParagraphControlBtns from './paragraphControlBtns';
import { StyledParagraph } from './paragraph';

import { updateUserInput } from '../features/articleSlice';

interface FallbackComponentTypes {
	props: FallbackProps;
	paragraphText: string;
	paragraphId: string;
}

// TODO bug regarding the edit functionality
var FallbackComponent = ({ props: { resetErrorBoundary }, paragraphText, paragraphId }: FallbackComponentTypes) => {
	let dispatch = useAppDispatch();

	// if (paragraphStatus === 'editing') {
	// 	return <UserInput paragraphId={paragraphId} />;
	// }
	return (
		<>
			<StyledParagraph onClick={() => dispatch(updateUserInput(paragraphId))}>{paragraphText}</StyledParagraph>
			<button onClick={() => resetErrorBoundary()}>Retry</button>
		</>
	);
};

export var ArticleDisplay = () => {
	let QueryClient = useQueryClient();

	// state values
	let dispatch = useAppDispatch();
	let article = useAppSelector(selectArticle);

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
			<Wrapper key={paragraph.id} draggable id={paragraph.id} onDragOver={(ev) => ev.preventDefault()} onDragStart={handleDrag} onDrop={handleDrop}>
				<ErrorBoundary
					fallbackRender={(props) => (
						<FallbackComponent {...{ props }} paragraphText={paragraph.paragraphBeforeGrammarFix} paragraphId={paragraph.id} />
					)}
					onReset={() => {
						// handle network error
						QueryClient.ensureQueryData({ queryKey: gptKeys(paragraph.paragraphBeforeGrammarFix), queryFn: queryGPT });
					}}
					onError={(error) => createToast({ type: 'error', message: error.message })}
				>
					<Paragraph paragraph={paragraph} />
					<ParagraphControlBtns paragraphId={paragraph.id} />
				</ErrorBoundary>
			</Wrapper>
		);
	});
};

var Wrapper = styled.article // .attrs(() => ({
// 	draggable: true,
// }))
`
	padding: 1rem;
	margin-bottom: 1rem;
	background-color: lightgray;
	cursor: grab;
`;
