// library
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query'; // https://www.thisdot.co/blog/common-patterns-and-nuances-using-react-query/#handling-errors-with-error-boundaries

// console would still log the error, see https://github.com/facebook/react/issues/15069
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd'; // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/

// redux
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, handleParagraphOrderChange, Paragraph as ParagraphType, updateUserInput } from '../features/articleSlice';

// components
import ParagraphInput from './paragraphInput';
import ArticleInput from './articleInput';
import Paragraph from './paragraph';
import ParagraphControlBtns from './paragraphControlBtns';
import { StyledParagraph } from './paragraph';
import EmptyParagraphList from './emptyParagraphList';

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

export var ArticleDisplay = () => {
	// state values
	let dispatch = useAppDispatch();
	let article = useAppSelector(selectArticle);

	let handleOnDragEnd = (result: DropResult) => {
		let { destination, source } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		dispatch(handleParagraphOrderChange({ destinationIndex: destination.index, sourceIndex: source.index }));
	};

	let { reset } = useQueryErrorResetBoundary();

	if (article.status === 'acceptingUserInput') {
		return <ArticleInput />;
	}

	return (
		<DragDropContext onDragEnd={handleOnDragEnd}>
			<StrictModeDroppable droppableId='paragraphs'>
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						{article.paragraphs.filter((paragraph) => !article.paragraphRemoveQueue.includes(paragraph.id)).length === 0 && <EmptyParagraphList />}
						{article.paragraphs
							.filter((paragraph) => !article.paragraphRemoveQueue.includes(paragraph.id))
							.map((paragraph: ParagraphType, index) => {
								return (
									<Draggable key={paragraph.id} draggableId={paragraph.id} index={index}>
										{(provided) => (
											<Wrapper ref={provided.innerRef} {...provided.draggableProps}>
												<div className='grabber' {...provided.dragHandleProps}></div>
												<ErrorBoundary
													fallbackRender={({ resetErrorBoundary }) => {
														if (paragraph.paragraphStatus === 'editing') {
															return <ParagraphInput paragraphId={paragraph.id} resetErrorBoundary={resetErrorBoundary} />;
														}
														return (
															<>
																<StyledParagraph onClick={() => dispatch(updateUserInput(paragraph.id))}>
																	{paragraph.paragraphBeforeGrammarFix}
																</StyledParagraph>
																<button
																	onClick={async () => {
																		resetErrorBoundary();
																	}}
																>
																	Retry
																</button>
															</>
														);
													}}
													onError={(error) => {
														createToast({ type: 'error', content: error.message, toastId: error.message });
													}}
													onReset={reset}
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
						{/* For the `ParagraphControlBtns` element, if the toastContainer were within the element itself, then every element would render a separate toast. */}
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
	white-space: pre-wrap; // preserve user input line feeds

	.grabber {
		width: 2rem;
		height: 2rem;
		background-color: lightskyblue;
	}
`;
