// libraries
import { useEffect, useState, useRef } from 'react';
// console would still log the error, see https://github.com/facebook/react/issues/15069
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary, useIsFetching, useQueryClient } from '@tanstack/react-query'; // https://www.thisdot.co/blog/common-patterns-and-nuances-using-react-query/#handling-errors-with-error-boundaries
import { Navigate, useParams, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { DragDropContext, Draggable, Droppable, DropResult, DragStart } from '@hello-pangea/dnd'; // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/
import { mergeRefs } from 'react-merge-refs';
import { useHotkeysContext } from 'react-hotkeys-hook';
import cs from 'classnames';
import { RxHamburgerMenu, RxDragHandleDots1 } from 'react-icons/rx';

// redux
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectArticle, handleParagraphOrderChange, updateUserInput, toggleTranslation } from '../features/articleSlice';

// components
import {
	ParagraphInput,
	Paragraph,
	EmptyParagraphList,
	ArticleControlBtns,
	useFocusedParagraphIndexContext,
	ParagraphControlBtns,
	AutoFocusWrapper,
} from '../components';
import { ParagraphWrapper, StyledParagraph, Button, BtnContainer } from '../styles';
import { ControlOptionsMenuContainerStyles } from './ControlOptionsMenuContainerStyles';

// utils
import { createToast, throwIfUndefined, useKeys, HotkeyMapData } from '../utils';

// types
import { Paragraph as ParagraphType } from '../types';

// query
import { grammarQueryKeys } from '../query/grammarQuery';
import { translationQueryKeys } from '../query/translationQuery';

export var Article = () => {
	// react router
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

	/* Error boundary related */
	let errorBoundaryFallbackElementCount = useRef(0);
	let resetErrorBoundariesRef = useRef(new Map<string, FallbackProps['resetErrorBoundary']>());
	let [showRetryAllButton, setShowRetryAllButton] = useState(false);

	// to add a retry all button when there's more than one sentences failed to request grammar fixes
	let grammarFixFetchingCount = useIsFetching({ queryKey: ['grammar'] });
	let handleRetryAll = () => resetErrorBoundariesRef.current.forEach((resetter) => resetter());

	useEffect(() => {
		if (grammarFixFetchingCount === 0) {
			if (errorBoundaryFallbackElementCount.current! > 1) {
				setShowRetryAllButton(true);
			} else if (errorBoundaryFallbackElementCount.current! <= 1) {
				setShowRetryAllButton(false);
			}
		}
	}, [grammarFixFetchingCount]);

	/* hotkey related */
	let {
		'Article Page': { retryAllErred, traverseDownwardsParagraphList, traverseUpwardsParagraphList },
	} = HotkeyMapData();

	let articleElementRefs = useRef(new Map());
	let articleElements = Array.from(articleElementRefs.current, (item) => ({
		paragraphId: item[0],
		element: item[1],
	}));

	let focusedParagraphIndexRef = useFocusedParagraphIndexContext();

	let { enableScope, disableScope, enabledScopes } = useHotkeysContext();
	let performEnableScope = (scope: string) => {
		enabledScopes.forEach((scope) => {
			disableScope(scope);
		});
		enableScope(scope);
	};

	// disable any enabled hotkey scope when a paragraph is deleted, which is easier to handle
	useEffect(() => {
		articleElements = Array.from(articleElementRefs.current, (item) => ({
			paragraphId: item[0],
			element: item[1],
		}));
		if (articleElements.findIndex((article) => article.paragraphId === enabledScopes[0]) !== focusedParagraphIndexRef.current) {
			disableScope(enabledScopes[0]);
		}
	});

	useKeys({ keyBinding: retryAllErred.hotkey, callback: handleRetryAll, enabled: !/preview$/.test(location.pathname) }); // enabled only when on the article page

	// traverse downwards through the paragraph list
	useKeys({
		keyBinding: traverseDownwardsParagraphList.hotkey,
		callback: () => {
			// Recalculate articleElements before using the shortcut; drag-and-drop could introduce inconsistencies.
			articleElements = Array.from(articleElementRefs.current, (item) => ({
				paragraphId: item[0],
				element: item[1],
			}));
			if (articleElements.length === 0) return;
			if (focusedParagraphIndexRef.current === -1) {
				articleElements[0].element.focus();
				focusedParagraphIndexRef.current = 0;
				performEnableScope(articleElements[0].paragraphId);
			} else {
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
			// Recalculate articleElements before using the shortcut; drag-and-drop could introduce inconsistencies.
			articleElements = Array.from(articleElementRefs.current, (item) => ({
				paragraphId: item[0],
				element: item[1],
			}));
			if (articleElements.length === 0) return;
			if (focusedParagraphIndexRef.current === -1) {
				articleElements[articleElements.length - 1].element.focus();
				focusedParagraphIndexRef.current = articleElements.length - 1;
				performEnableScope(articleElements[articleElements.length - 1].paragraphId);
			} else {
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

	/* react beautiful dnd */
	/* v8 ignore next 11 */
	let handleOnDragEnd = (result: DropResult) => {
		let { destination, source } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		dispatch(handleParagraphOrderChange({ destinationIndex: destination.index, sourceIndex: source.index, articleId }));
		// To ensure that the `focusedParagraphIndexRef` updates in accordance with the drag and drop action
		if (focusedParagraphIndexRef.current !== -1) {
			focusedParagraphIndexRef.current = destination.index;
		}
	};

	// give dragging item focus, to properly handle the enabling of hotkey scope
	/* v8 ignore next 7 */
	let handleOnDargStart = ({ draggableId }: DragStart) => {
		articleElements.map((item) => {
			if (item.paragraphId === draggableId) {
				item.element.focus();
			}
		});
	};

	/* other */
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
				if (
					!queryClient.getQueryData(grammarQueryKeys(paragraph.paragraphBeforeGrammarFix, paragraph.id)) &&
					// add below condition to only reset queries when there are none ongoing, otherwise there would be multiple canceled queries during the initial loading
					queryClient.isFetching({ queryKey: grammarQueryKeys(paragraph.paragraphBeforeGrammarFix, paragraph.id) }) === 0
				) {
					queryClient.resetQueries(
						{
							queryKey: grammarQueryKeys(paragraph.paragraphBeforeGrammarFix, paragraph.id),
						},
						// somehow this throws CancelledError {revert: true, silent: undefined}
						{ throwOnError: true }
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
		<StyledSection>
			{filteredParagraphs.length === 0 && combinedArticleQueue.indexOf(articleId) !== -1 && <EmptyParagraphList />}
			<div className='article-controls'>
				{filteredParagraphs.length !== 0 && <ArticleControlBtns articleId={articleId} />}
				{showRetryAllButton && (
					<Button onClick={handleRetryAll} disabled={grammarFixFetchingCount > 0} data-tooltip-id='hotkey' data-tooltip-content={retryAllErred.label}>
						Retry All
					</Button>
				)}
			</div>
			<DragDropContext onDragEnd={handleOnDragEnd} onDragStart={handleOnDargStart}>
				<Droppable droppableId='paragraphs'>
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							<AutoFocusWrapper>
								{filteredParagraphs.map((paragraph: ParagraphType, index) => {
									return (
										<Draggable key={paragraph.id} draggableId={paragraph.id} index={index}>
											{(provided) => (
												<StyledArticle
													ref={mergeRefs([
														provided.innerRef,
														(node) => {
															if (node) {
																articleElementRefs.current.set(paragraph.id, node);
															} else {
																// To keep the ref reflects the current paragraph structure.
																articleElementRefs.current.delete(paragraph.id);
															}
														},
													])}
													{...provided.draggableProps}
													tabIndex={-1} // make the element focusable
													onClick={(e) => {
														if (e.target === e.currentTarget) {
															// prevent other interactions to change the focused element
															focusedParagraphIndexRef.current = index;
															performEnableScope(paragraph.id);
														}
													}}
													// Make the newly inserted empty paragraph the hotkey-enabled one. Thus, pressing d, =, or - won't trigger actions in other paragraphs.
													onFocus={() => {
														focusedParagraphIndexRef.current = index;
														performEnableScope(paragraph.id);
													}}
													className={cs({ active: focusedParagraphIndexRef.current === index })}
												>
													<div
														className='grabber'
														{...provided.dragHandleProps}
														onClick={
															(e) => e.currentTarget.focus() // to make initiating drag and drop from keyboard a bit easer
														}
													>
														<RxDragHandleDots1 />
													</div>
													<div className='content'>
														<QueryErrorResetBoundary>
															{({ reset }) => (
																<ErrorBoundary
																	fallbackRender={({ resetErrorBoundary }) => {
																		if (paragraph.paragraphStatus === 'editing') {
																			return <ParagraphInput paragraphId={paragraph.id} resetErrorBoundary={resetErrorBoundary} />;
																		}
																		return (
																			<ParagraphWrapper
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
																				<BtnContainer>
																					<Button
																						onClick={async () => {
																							resetErrorBoundary();
																						}}
																					>
																						Retry
																					</Button>
																				</BtnContainer>
																			</ParagraphWrapper>
																		);
																	}}
																	onError={(error) => {
																		createToast({ type: 'error', content: error.message, toastId: error.message });
																	}}
																	onReset={reset}
																>
																	<Paragraph paragraphId={paragraph.id} />
																</ErrorBoundary>
															)}
														</QueryErrorResetBoundary>
														<div className='paragraph-menu-container'>
															<div className='paragraph-menu'>
																<RxHamburgerMenu />
															</div>
															<ParagraphControlBtns
																paragraphId={paragraph.id}
																index={index}
																paragraphFocused={focusedParagraphIndexRef.current === index}
															/>
														</div>
													</div>
												</StyledArticle>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
								{/* For the `ParagraphControlBtns` element, if the toastContainer were within the element itself, then every element would render a separate toast. */}
							</AutoFocusWrapper>
						</div>
					)}
				</Droppable>
			</DragDropContext>
			<Outlet context={filteredParagraphs} />
		</StyledSection>
	);
};

var StyledArticle = styled.article`
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px;
	border: 1px solid black;
	border-radius: var(--border-radius);
	margin-bottom: 15px;
	background-color: var(--color-light);
	outline: none; /* there will be shadow added to the focused element, thus the default blue line is not needed */
	white-space: pre-wrap; /* preserve user input line feeds */

	&.active {
		box-shadow: 0 1rem 1rem rgb(0 0 0 / 30%);
	}

	.grabber {
		display: grid;

		/* https://www.joshwcomeau.com/css/css-variables-for-react-devs/#:~:text=industry%20guidelines%20are%20that%20interactive%20elements%20should%20be%20between%2044px%20and%2048px%20tall. */
		width: var(--util-icon-container-dimension);
		height: var(--util-icon-container-dimension);
		flex-basis: 5%;
		margin-right: 3px;
		cursor: grab;
		place-content: center;
	}

	.content {
		flex-basis: 95%;
	}

	.paragraph-menu-container {
		top: 10px;
		right: 10px;
		${ControlOptionsMenuContainerStyles}

		.paragraph-menu {
			display: grid;

			/* https://www.joshwcomeau.com/css/css-variables-for-react-devs/#:~:text=industry%20guidelines%20are%20that%20interactive%20elements%20should%20be%20between%2044px%20and%2048px%20tall. */
			width: var(--util-icon-container-dimension);
			height: var(--util-icon-container-dimension);
			place-content: center;
		}

		.paragraph-menu:hover + div {
			display: flex;
		}
	}
`;

var StyledSection = styled.section`
	flex-grow: 1;
	padding-top: 10px;
	margin-top: var(--header-offset);

	.article-controls {
		display: flex;
		margin-bottom: 16px;
		gap: var(--gap-small);

		a {
			color: inherit;
			text-decoration: none;
		}
	}
`;
