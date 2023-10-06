// library
import { useEffect, useState } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
// console would still log the error, see https://github.com/facebook/react/issues/15069
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd'; // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/

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
	paragraphId: string;
}

var FallbackComponent = ({ props: { resetErrorBoundary }, paragraphId }: FallbackComponentTypes) => {
	let dispatch = useAppDispatch();
	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as ParagraphType;

	// allow edit
	// TODO After editing, prevent the original paragraph from retrying.
	if (currentParagraph.paragraphStatus === 'editing') {
		return <UserInput paragraphId={paragraphId} resetErrorBoundary={resetErrorBoundary} />;
	}

	return (
		<>
			<StyledParagraph onClick={() => dispatch(updateUserInput(paragraphId))}>{currentParagraph.paragraphBeforeGrammarFix}</StyledParagraph>
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
		let { destination, source } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		dispatch(handleParagraphOrderChange({ destinationIndex: destination.index, sourceIndex: source.index }));
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
										<Wrapper ref={provided.innerRef} {...provided.draggableProps}>
											<div className='grabber' {...provided.dragHandleProps}></div>
											<ErrorBoundary
												fallbackRender={(props) => <FallbackComponent {...{ props }} paragraphId={paragraph.id} />}
												onReset={() => {
													// handle network error
													console.log(paragraph.paragraphBeforeGrammarFix);

													QueryClient.ensureQueryData({ queryKey: gptKeys(paragraph.paragraphBeforeGrammarFix), queryFn: queryGPT });
												}}
												onError={(error) => createToast({ type: 'error', message: error.message })}
											>
												<Paragraph paragraph={paragraph} />
											</ErrorBoundary>
											<ParagraphControlBtns paragraphId={paragraph.id} />
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

var Wrapper = styled.article`
	padding: 1rem;
	margin-bottom: 1rem;
	background-color: lightgray;
	display: flex;
	flex-direction: column;

	.grabber {
		width: 2rem;
		height: 2rem;
		background-color: lightskyblue;
	}
`;
