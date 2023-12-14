// libraries
import { useEffect, useState, useRef } from 'react';
// console would still log the error, see https://github.com/facebook/react/issues/15069
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary, useIsFetching, useQueryClient } from '@tanstack/react-query'; // https://www.thisdot.co/blog/common-patterns-and-nuances-using-react-query/#handling-errors-with-error-boundaries
import { Navigate, useParams, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd'; // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/
import { mergeRefs } from 'react-merge-refs';
import { useHotkeysContext } from 'react-hotkeys-hook';

// redux
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectArticle, handleParagraphOrderChange, updateUserInput, toggleTranslation } from '../features/articleSlice';

// components
import { StyledParagraph, ParagraphInput, Paragraph, ParagraphControlBtns, EmptyParagraphList, ArticleControlBtns } from '../components';

// utils
import { createToast, throwIfUndefined, useKeys, hotkeyMap } from '../utils';

// types
import { Paragraph as ParagraphType } from '../types';

import { grammarQueryKeys } from '../query/grammarQuery';
import { translationQueryKeys } from '../query/translationQuery';

var {
	articlePage: { retryAllErred, traverseDownwardsParagraphList, traverseUpwardsParagraphList },
} = hotkeyMap;

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
	let location = useLocation();

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
	let errorBoundaryFallbackElementCount = useRef(0);
	let resetErrorBoundariesRef = useRef(new Map<string, FallbackProps['resetErrorBoundary']>());
	let [showRetryAllButton, setShowRetryAllButton] = useState(false);

	// to add a retry all button when there's more than one sentences failed to request grammar fixes
	let grammarFixFetchingCount = useIsFetching({ queryKey: ['grammar'] });
	let handleRetryAll = () => resetErrorBoundariesRef.current.forEach((resetter) => resetter());

	useKeys({ keyBinding: retryAllErred.hotkey, callback: handleRetryAll, enabled: !/preview$/.test(location.pathname) }); // enabled only when on the article page

	let articleElementsRef = useRef(new Map());
	let focusedParagraphIndexRef = useRef(-1);
	let { enableScope, disableScope, enabledScopes } = useHotkeysContext();

	let performEnableScope = (scope: string) => {
		enabledScopes.forEach((scope) => {
			disableScope(scope);
		});
		enableScope(scope);
	};

	// traverse downwards through the paragraph list
	useKeys({
		keyBinding: traverseDownwardsParagraphList.hotkey,
		callback: () => {
			let articleElements = Array.from(articleElementsRef.current, (item) => ({
				paragraphId: item[1].paragraphId,
				element: item[1].element,
			}));

			if (articleElements.length === 0) return;

			if (focusedParagraphIndexRef.current === -1) {
				articleElements[0].element.focus();
				focusedParagraphIndexRef.current = 0;
				performEnableScope(articleElements[0].paragraphId);
			} else {
				// update focusedParagraphIndexRef to reflect the actual situation: new paragraphs get added
				articleElements.forEach((item, index) => {
					if (enabledScopes.includes(item.paragraphId)) {
						focusedParagraphIndexRef.current = index;
					}
				});

				// when the focused paragraph gets deleted, this makes sure user still steps one paragraph forward
				if (!articleElements.some((item) => enabledScopes.includes(item.paragraphId))) {
					focusedParagraphIndexRef.current -= 1;
				}

				focusedParagraphIndexRef.current += 1;
				if (focusedParagraphIndexRef.current > articleElements.length - 1) {
					focusedParagraphIndexRef.current = 0;
				}

				articleElements[focusedParagraphIndexRef.current].element.focus();

				// enable scope
				performEnableScope(articleElements[focusedParagraphIndexRef.current].paragraphId);
			}
		},
	});

	// traverse upwards through the paragraph list
	useKeys({
		keyBinding: traverseUpwardsParagraphList.hotkey,
		callback: () => {
			let articleElements = Array.from(articleElementsRef.current, (item) => ({
				paragraphId: item[1].paragraphId,
				element: item[1].element,
			}));
			if (articleElements.length === 0) return;

			if (focusedParagraphIndexRef.current === -1) {
				articleElements[articleElements.length - 1].element.focus();
				focusedParagraphIndexRef.current = articleElements.length - 1;
				performEnableScope(articleElements[articleElements.length - 1].paragraphId);
			} else {
				// update focusedParagraphIndexRef to reflect the actual situation: new paragraphs get added
				articleElements.forEach((item, index) => {
					if (enabledScopes.includes(item.paragraphId)) {
						focusedParagraphIndexRef.current = index;
					}
				});

				focusedParagraphIndexRef.current -= 1;
				if (focusedParagraphIndexRef.current < 0) {
					focusedParagraphIndexRef.current = articleElements.length - 1;
				}
				articleElements[focusedParagraphIndexRef.current].element.focus();

				// enable scope
				performEnableScope(articleElements[focusedParagraphIndexRef.current].paragraphId);
			}
		},
	});

	useEffect(() => {
		if (grammarFixFetchingCount === 0) {
			if (errorBoundaryFallbackElementCount.current! > 1) {
				setShowRetryAllButton(true);
			} else if (errorBoundaryFallbackElementCount.current! <= 1) {
				setShowRetryAllButton(false);
			}
		}
	}, [grammarFixFetchingCount]);

	let queryClient = useQueryClient();
	useEffect(() => {
		// cancel queries when navigate away
		if (/preview$/.test(location.pathname)) {
			queryClient.cancelQueries({ queryKey: ['grammar'] });
			filteredParagraphs.forEach((paragraph) => {
				// cancel ongoing translation queries when navigate away
				if (
					paragraph.showTranslation &&
					queryClient.isFetching({ queryKey: translationQueryKeys(paragraph.paragraphAfterGrammarFix, paragraph.id) }) > 0
				) {
					dispatch(toggleTranslation(paragraph.id));
				}
			});
		} else {
			// refetch queries when navigate back
			filteredParagraphs.forEach((paragraph) => {
				if (!queryClient.getQueryData(grammarQueryKeys(paragraph.paragraphBeforeGrammarFix, paragraph.id))) {
					queryClient.resetQueries(
						{
							queryKey: grammarQueryKeys(paragraph.paragraphBeforeGrammarFix, paragraph.id),
						}
						// somehow this throws CancelledError {revert: true, silent: undefined}
						// { throwOnError: true }
					);
				}
			});
		}
	}, [dispatch, filteredParagraphs, location.pathname, queryClient]);

	// handle not found routes
	if (combinedArticleQueue.indexOf(articleId) === -1) {
		return <Navigate to='/' />;
	}

	return (
		<>
			{filteredParagraphs.length !== 0 && <ArticleControlBtns articleId={articleId} />}
			{showRetryAllButton && (
				<div>
					<button onClick={handleRetryAll} disabled={grammarFixFetchingCount > 0} data-tooltip-id='hotkey' data-tooltip-content={retryAllErred.label}>
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
											<Wrapper
												// ref={provided.innerRef}
												ref={mergeRefs([
													provided.innerRef,
													(node) => {
														if (node) {
															articleElementsRef.current.set(index, { element: node, paragraphId: paragraph.id });
														} else {
															// To keep the ref reflects the current paragraph structure.
															articleElementsRef.current.delete(index);
														}
													},
												])}
												{...provided.draggableProps}
												tabIndex={-1}
												onFocus={() => {
													// For situations where a user manually clicks an element to gain focus
													if (focusedParagraphIndexRef.current !== index) {
														focusedParagraphIndexRef.current = index;
													}
												}}
											>
												<div className='grabber' {...provided.dragHandleProps}></div>
												<QueryErrorResetBoundary>
													{({ reset }) => (
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
																				resetErrorBoundariesRef.current.set(paragraph.id, resetErrorBoundary);
																				errorBoundaryFallbackElementCount.current += 1;
																			} else {
																				resetErrorBoundariesRef.current.delete(paragraph.id);
																				errorBoundaryFallbackElementCount.current -= 1;
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
													)}
												</QueryErrorResetBoundary>
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
