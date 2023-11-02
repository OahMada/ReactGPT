// library
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query'; // https://www.thisdot.co/blog/common-patterns-and-nuances-using-react-query/#handling-errors-with-error-boundaries
import { useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

// console would still log the error, see https://github.com/facebook/react/issues/15069
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd'; // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/

// redux
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectArticle, handleParagraphOrderChange, Paragraph as ParagraphType, updateUserInput } from '../features/articleSlice';

// components
import ParagraphInput from '../components/paragraphInput';
// import ArticleInput from './articleInput';
import Paragraph from '../components/paragraph';
import ParagraphControlBtns from '../components/paragraphControlBtns';
import { StyledParagraph } from '../components/paragraph';
import EmptyParagraphList from '../components/emptyParagraphList';
import ArticleControlBtns from '../components/articleControlBtns';

// utils
import { createToast, throwIfUndefined } from '../utils';

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

var Article = () => {
	// state values
	let dispatch = useAppDispatch();
	let article = useAppSelector(selectArticle);
	let { articleId } = useParams();
	throwIfUndefined(articleId);
	let filteredParagraphs = article.paragraphs
		// filter paragraphs by articleId
		.filter((paragraph) => paragraph.articleId === articleId)
		// filter out removed paragraphs
		.filter((paragraph) => !article.paragraphRemoveQueue.includes(paragraph.id));

	let handleOnDragEnd = (result: DropResult) => {
		let { destination, source } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		dispatch(handleParagraphOrderChange({ destinationIndex: destination.index, sourceIndex: source.index }));
	};

	let { reset } = useQueryErrorResetBoundary();

	return (
		<>
			<ArticleControlBtns articleId={articleId} />
			<DragDropContext onDragEnd={handleOnDragEnd}>
				<StrictModeDroppable droppableId='paragraphs'>
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{filteredParagraphs.length === 0 && <EmptyParagraphList />}
							{filteredParagraphs.map((paragraph: ParagraphType, index) => {
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
			<ToastContainer enableMultiContainer containerId={'paragraphDeletion'} closeOnClick={false} closeButton={false} />
			<ToastContainer limit={3} enableMultiContainer />
		</>
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

export default Article;
