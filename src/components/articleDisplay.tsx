// library
import { useEffect, useState } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd';

// query
import { useQueryClient } from '@tanstack/react-query';
import { gptKeys, queryGPT } from '../query/GPT';

// redux
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, handleParagraphOrderChange, Paragraph as ParagraphType, updateUserInput } from '../features/articleSlice';

// components
import UserInput from './userInput';
import Paragraph from './paragraph';
import ParagraphControlBtns from './paragraphControlBtns';
import { StyledParagraph } from './paragraph';

// utils
import { createToast } from '../utils';

// Credits to https://github.com/GiovanniACamacho and https://github.com/Meligy for the TypeScript version
// Original post: https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194
var StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const animation = requestAnimationFrame(() => setEnabled(true));

		return () => {
			cancelAnimationFrame(animation);
			setEnabled(false);
		};
	}, []);

	if (!enabled) {
		return null;
	}

	return <Droppable {...props}>{children}</Droppable>;
};

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

	let handleOnDragEnd = (result: DropResult) => {
		if (!result.destination) return;
		dispatch(handleParagraphOrderChange({ destinationIndex: result.destination.index, sourceIndex: result.source.index }));
	};

	if (article.status === 'acceptingUserInput') {
		return <UserInput />;
	}

	return (
		<DragDropContext onDragEnd={handleOnDragEnd}>
			<StrictModeDroppable droppableId='paragraphs'>
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						{article.paragraphs.map((paragraph: ParagraphType, index) => {
							return (
								<Draggable key={paragraph.id} draggableId={paragraph.id} index={index}>
									{(provided) => (
										<Wrapper ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
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
									)}
								</Draggable>
							);
						})}
						{provided.placeholder}
					</div>
				)}
			</StrictModeDroppable>
		</DragDropContext>
	);
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
