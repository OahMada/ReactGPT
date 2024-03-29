import styled from 'styled-components';
import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRef, useLayoutEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { refactoredChange, EditHistoryMode, Paragraph as ParagraphType } from '../types';

import { useGrammarQuery, grammarQueryKeys } from '../query/grammarQuery';
import { translationQueryKeys } from '../query/translationQuery';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentParagraphState,
	revertToBeginning,
	reFetchGrammarMistakes,
	updateUserInput,
	alterCheckEditHistoryMode,
	toggleTranslation,
	updateParagraphEditDate,
	selectArticle,
} from '../features/articleSlice';
import { updateModalContent, showModal, hideModal, selectModal } from '../features/modalSlice';

import { Modal, ParagraphInput, ParagraphTranslation, useAutoFocusContext } from '.';
import { ParagraphWrapper, StyledParagraph, ErrorBoundaryWrapper, BtnContainer } from '../styled';
import { Button } from '../styled/button';

export var Paragraph = ({ paragraphId }: { paragraphId: string }) => {
	let { setAutoFocus } = useAutoFocusContext();
	let { paragraphs } = useAppSelector(selectArticle);
	let {
		initialParagraph,
		updatedInitialParagraph,
		paragraphBeforeGrammarFix,
		paragraphAfterGrammarFix,
		adjustmentObjectArr,
		allAdjustmentsCount,
		paragraphStatus,
		editHistoryMode,
		showTranslation,
	} = paragraphs.find((item) => paragraphId === item.id) as ParagraphType;
	let { displayModal } = useAppSelector(selectModal);

	let doneButtonRef = useRef<HTMLButtonElement>(null);
	let modalRef = useRef<HTMLDivElement>(null);
	let modalOffsetsRef = useRef({ top: 0, left: 0 });

	// dispatch
	let dispatch = useAppDispatch();

	// fetch API
	// isGrammarFixesFetching is for action initiated by click the fix grammar mistakes button
	let { isPending: isGrammarFixesPending, isFetching: isGrammarFixesFetching } = useGrammarQuery(paragraphBeforeGrammarFix, paragraphId);

	// query client
	let QueryClient = useQueryClient();

	let { reset } = useQueryErrorResetBoundary();

	// handlers
	let mouseEnterHandler = (e: React.MouseEvent<HTMLElement>, item: refactoredChange, index: number) => {
		let { left, top } = e.currentTarget.getBoundingClientRect();
		// target is whatever you actually clicked on. It can vary, as this can be within an element that the event was bound to.
		// currentTarget is the element you actually bound the event to. This will never change.
		let color = e.currentTarget.dataset.color!;
		dispatch(updateModalContent({ modifiedObj: item, dimension: { left, top }, color, indexInParagraph: index, paragraphStatus, paragraphId }));
		dispatch(showModal());
	};

	let mouseLeaveHandler = () => {
		dispatch(hideModal());
	};

	let handleEditHistoryMode = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(alterCheckEditHistoryMode({ paragraphId, mode: e.target.value as EditHistoryMode }));
		dispatch(checkEditHistory(paragraphId));
	};

	// automatically click the done button a certain condition
	/* v8 ignore next 8 */
	toast.onChange((toastItem) => {
		if (toastItem.status === 'removed' && toastItem.id === paragraphId + 'NoGrammarMistakes' && paragraphStatus === 'modifying') {
			// If the toastId check isn't included, changes to any toast would trigger the following.
			if (doneButtonRef.current) {
				doneButtonRef.current!.click();
			}
		}
	});

	// https://react.dev/reference/react/useLayoutEffect#measuring-layout-before-the-browser-repaints-the-screen
	useLayoutEffect(() => {
		if (modalRef.current) {
			let { height, right } = modalRef.current.getBoundingClientRect();
			let leftOffset = 0;
			// calculate the viewport offset
			/* v8 ignore next 3 */
			if (right > window.innerWidth) {
				leftOffset = right - window.innerWidth;
			}
			modalOffsetsRef.current = { top: -height, left: -leftOffset };
		}
	}, [displayModal]);
	// -------------- Editing--------------

	if (paragraphStatus === 'editing') {
		return <ParagraphInput paragraphId={paragraphId} />;
	}

	// -------------- Modifying / Reviving --------------
	if (paragraphStatus === 'modifying' || paragraphStatus === 'reviving') {
		return (
			<>
				<ExtendedParagraphWrapper>
					{paragraphStatus === 'reviving' && (
						<fieldset>
							<legend>Check edit history mode:</legend>
							<div>
								<input
									type='radio'
									id={`${paragraphId}Creation`}
									name={paragraphId}
									value='paragraphCreation'
									checked={editHistoryMode === 'paragraphCreation'}
									onChange={handleEditHistoryMode}
								/>
								<label htmlFor={`${paragraphId}Creation`}>Since Paragraph Creation</label>
							</div>
							<div>
								<input
									type='radio'
									id={`${paragraphId}LastEdit`}
									name={paragraphId}
									value='paragraphLastEdit'
									checked={editHistoryMode === 'paragraphLastEdit'}
									onChange={handleEditHistoryMode}
									disabled={initialParagraph === updatedInitialParagraph}
								/>
								<label htmlFor={`${paragraphId}LastEdit`}>Since Paragraph Last Edit</label>
							</div>
						</fieldset>
					)}
					{isGrammarFixesPending || isGrammarFixesFetching ? (
						<StyledParagraph>{paragraphBeforeGrammarFix}</StyledParagraph>
					) : (
						<StyledParagraph>
							{
								// the three dots indicate that these are not a list
								...adjustmentObjectArr.reduce<React.ReactNode[]>((acc, item, index) => {
									if (item.value) {
										acc.push(item.value);
									} else if (item.removed || item.added) {
										if (item.added && !item.removed) {
											let element =
												paragraphStatus === 'modifying' ? (
													<span onMouseEnter={(e) => mouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
														<ins className='insert'>{item.addedValue}</ins>
													</span>
												) : (
													<span onMouseEnter={(e) => mouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
														<StyledSpan className='deletion' $isSpace={item.addedValue === ' '}>
															{item.addedValue}
														</StyledSpan>
													</span>
												);
											acc.push(element);
										} else if (item.added && item.removed) {
											let element =
												paragraphStatus === 'modifying' ? (
													<span onMouseEnter={(e) => mouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightblue'>
														<span className='replacement'>{item.addedValue}</span>
													</span>
												) : (
													<span onMouseEnter={(e) => mouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightblue'>
														<span className='replacement'>{item.removedValue}</span>
													</span>
												);

											acc.push(element);
										} else if (!item.added && item.removed) {
											let element =
												paragraphStatus === 'modifying' ? (
													<span onMouseEnter={(e) => mouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
														<StyledSpan className='deletion' $isSpace={item.removedValue === ' '}>
															{item.removedValue}
														</StyledSpan>
													</span>
												) : (
													<span onMouseEnter={(e) => mouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
														<ins className='insert'>{item.removedValue}</ins>
													</span>
												);
											acc.push(element);
										}
									}
									return acc;
								}, [])
							}
						</StyledParagraph>
					)}
					<BtnContainer>
						<Button
							onClick={() => {
								dispatch(acceptAllAdjustments(paragraphId));
								dispatch(updateParagraphEditDate(paragraphId));
							}}
							disabled={allAdjustmentsCount === 0 || isGrammarFixesPending || isGrammarFixesFetching}
						>
							{paragraphStatus === 'modifying' && 'Accept All'}
							{paragraphStatus === 'reviving' && 'Revert All'}
						</Button>
						<Button
							onClick={() => {
								// to make sure the next time, paragraph changed back to old content, there will be a refetch
								QueryClient.invalidateQueries({
									queryKey: grammarQueryKeys(paragraphBeforeGrammarFix, paragraphId),
									exact: true,
									refetchType: 'none',
								});
								dispatch(doneWithCurrentParagraphState(paragraphId));
								toast.isActive(paragraphId + 'NoGrammarMistakes') && toast.dismiss(paragraphId + 'NoGrammarMistakes');
							}}
							disabled={isGrammarFixesPending || isGrammarFixesFetching}
							ref={doneButtonRef}
						>
							Done
						</Button>
					</BtnContainer>
				</ExtendedParagraphWrapper>
				<Modal ref={modalRef} modalOffsets={modalOffsetsRef.current} />
			</>
		);
	}
	// -------------- Done Modification --------------
	if (paragraphStatus === 'doneModification') {
		return (
			<ExtendedParagraphWrapper>
				<h4>Click Paragraph to Edit</h4>
				<StyledParagraph
					onClick={() => {
						setAutoFocus(true);
						dispatch(updateUserInput(paragraphId));
					}}
				>
					{paragraphAfterGrammarFix}
				</StyledParagraph>
				{showTranslation && (
					<ErrorBoundary
						onReset={reset}
						fallbackRender={({ resetErrorBoundary }) => (
							<ErrorBoundaryWrapper>
								<StyledParagraph>
									<i>There was an error!</i>
								</StyledParagraph>
								<Button onClick={() => resetErrorBoundary()}>Try again</Button>
							</ErrorBoundaryWrapper>
						)}
					>
						<ParagraphTranslation paragraph={{ paragraphText: paragraphAfterGrammarFix, paragraphId }} />
					</ErrorBoundary>
				)}
				<BtnContainer>
					<Button onClick={() => dispatch(checkEditHistory(paragraphId))} disabled={paragraphAfterGrammarFix === initialParagraph}>
						Show Edit History
					</Button>
					<Button
						onClick={() => {
							dispatch(revertToBeginning(paragraphId));
							dispatch(updateParagraphEditDate(paragraphId));
						}}
						disabled={paragraphAfterGrammarFix === initialParagraph}
					>
						Revert All Changes
					</Button>
					<Button
						onClick={() => {
							QueryClient.invalidateQueries({
								queryKey: grammarQueryKeys(paragraphBeforeGrammarFix, paragraphId),
								exact: true,
							});
							dispatch(reFetchGrammarMistakes(paragraphId));
						}}
					>
						Find Grammar Mistakes
					</Button>
					<Button
						onClick={() => {
							if (showTranslation) {
								QueryClient.cancelQueries({ queryKey: translationQueryKeys(paragraphAfterGrammarFix, paragraphId) });
							}
							dispatch(toggleTranslation(paragraphId));
							reset();
						}}
					>
						{!showTranslation ? 'Show Translation' : 'Hide Translation'}
					</Button>
				</BtnContainer>
			</ExtendedParagraphWrapper>
		);
	}
};

var StyledSpan = styled.span<{ $isSpace: boolean }>`
	text-decoration: ${({ $isSpace }) => ($isSpace ? 'none' : 'line-through')};
`;

var ExtendedParagraphWrapper = styled(ParagraphWrapper)`
	h4 {
		color: var(--color-darkest);
		font-size: var(--font-small);
		font-weight: 500;
		line-height: var(--util-icon-container-dimension);
	}

	fieldset {
		display: flex;
		border: 1px solid var(--color-darker);
		border-radius: var(--border-radius);
		margin-right: var(--util-icon-container-dimension);
		gap: var(--gap-huge);

		@media (width <= 62.5rem) {
			flex-direction: column;
			gap: var(--gap-primary);
		}

		@media (width <= 28.125rem) {
			font-size: var(--font-small);
		}

		input {
			display: inline-block;
			margin-right: 5px;
		}

		input:disabled + label {
			color: var(--color-darker);
		}
	}
`;
