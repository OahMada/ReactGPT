// libraries
import { useEffect, useState, useRef } from 'react';
// console would still log the error, see https://github.com/facebook/react/issues/15069
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary, useIsFetching } from '@tanstack/react-query'; // https://www.thisdot.co/blog/common-patterns-and-nuances-using-react-query/#handling-errors-with-error-boundaries
import { Navigate, useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd'; // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/
import { useLocalStorage } from 'react-use';

// redux
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectArticle, handleParagraphOrderChange, updateUserInput } from '../features/articleSlice';

// components
import { StyledParagraph, ParagraphInput, Paragraph, ParagraphControlBtns, EmptyParagraphList, ArticleControlBtns } from '../components';

// utils
import { createToast, throwIfUndefined } from '../utils';

// types
import { Paragraph as ParagraphType } from '../types';

// Credits to https://github.com/GiovanniACamacho and https://github.com/Meligy for the TypeScript version
// Original post: https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194
export var StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
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

export var Article = () => {
	const { articleId } = useParams();
	throwIfUndefined(articleId);

	// redux
	let dispatch = useAppDispatch();
	let article = useAppSelector(selectArticle);

	let combinedArticleQueue = [...article.articleQueue.favorites, ...article.articleQueue.normal];
	let filteredParagraphs = article.paragraphs
		// filter paragraphs by articleId
		.filter((paragraph) => paragraph.articleId === articleId)
		// filter out removed paragraphs
		.filter((paragraph) => !article.paragraphRemoveQueue.includes(paragraph.id));

	let handleOnDragEnd = (result: DropResult) => {
		let { destination, source } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		dispatch(handleParagraphOrderChange({ destinationIndex: destination.index, sourceIndex: source.index, articleId }));
	};

	// Error Boundary related
	let { reset } = useQueryErrorResetBoundary();
	let errorBoundaryFallbackElementCount = useRef(0);
	let [refValue, setRefValue, removeRefValue] = useLocalStorage('refValue', errorBoundaryFallbackElementCount.current); // to preserve Retry All button presence on page refresh
	let [showRetryAllButton, setShowRetryAllButton] = useState(false);

	// to add a retry all button when there's more than one sentences failed to request grammar fixes
	let grammarFixFetchingCount = useIsFetching({ queryKey: ['grammar'] });
	useEffect(() => {
		if (grammarFixFetchingCount === 0) {
			if (refValue! > 1) {
				setShowRetryAllButton(true);
			} else if (refValue! <= 1) {
				setShowRetryAllButton(false);
			}
		}
		return () => {
			removeRefValue();
		};
	}, [grammarFixFetchingCount, refValue, removeRefValue, setRefValue]);

	// handle not found routes
	if (combinedArticleQueue.indexOf(articleId) === -1) {
		return <Navigate to='/' />;
	}

	return (
		<>
			{filteredParagraphs.length !== 0 && <ArticleControlBtns articleId={articleId} />}
			{showRetryAllButton && (
				<div className='retry-all'>
					<button
						onClick={() =>
							// TODO retry all logic
							console.log('resetting')
						}
					>
						Retry All
					</button>
				</div>
			)}
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
															<div
																// reference https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
																ref={(node) => {
																	if (node) {
																		errorBoundaryFallbackElementCount.current += 1;
																		setRefValue(errorBoundaryFallbackElementCount.current);
																	} else {
																		errorBoundaryFallbackElementCount.current -= 1;
																		setRefValue(errorBoundaryFallbackElementCount.current);
																	}
																}}
															>
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
															</div>
														);
													}}
													onError={(error) => {
														createToast({ type: 'error', content: error.message, toastId: error.message });
													}}
													onReset={reset}
												>
													<div>
														<Paragraph paragraph={paragraph} />
													</div>
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
			<Outlet context={filteredParagraphs} />
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
