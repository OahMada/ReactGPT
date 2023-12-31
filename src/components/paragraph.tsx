import styled from 'styled-components';
import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRef } from 'react';
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

import { Modal, ParagraphInput, ParagraphTranslation } from '.';

export var Paragraph = ({ paragraphId }: { paragraphId: string }) => {
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

	let doneButtonRef = useRef<HTMLButtonElement>(null);

	// dispatch
	let dispatch = useAppDispatch();

	// fetch API
	// isGrammarFixesFetching is for action initiated by click the fix grammar mistakes button
	let { isPending: isGrammarFixesPending, isFetching: isGrammarFixesFetching } = useGrammarQuery(paragraphBeforeGrammarFix, paragraphId);

	// query client
	let QueryClient = useQueryClient();

	// state values
	let modal = useAppSelector(selectModal);

	let { reset } = useQueryErrorResetBoundary();

	// handlers
	let onMouseEnterHandler = (e: React.MouseEvent<HTMLElement>, item: refactoredChange, index: number) => {
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
	toast.onChange((toastItem) => {
		if (toastItem.status === 'removed' && toastItem.id === paragraphId + 'NoGrammarMistakes' && paragraphStatus === 'modifying') {
			// If the toastId check isn't included, changes to any toast would trigger the following.
			if (doneButtonRef.current) {
				doneButtonRef.current!.click();
			}
		}
	});

	// -------------- Editing--------------

	if (paragraphStatus === 'editing') {
		return <ParagraphInput paragraphId={paragraphId} />;
	}

	// -------------- Modifying / Reviving --------------
	if (paragraphStatus === 'modifying' || paragraphStatus === 'reviving') {
		return (
			<>
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
												<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
													<ins className='insert'>{item.addedValue}</ins>
												</span>
											) : (
												<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
													<del className='deletion'>{item.addedValue}</del>
												</span>
											);
										acc.push(element);
									} else if (item.added && item.removed) {
										let element =
											paragraphStatus === 'modifying' ? (
												<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightblue'>
													<del className='replacement'>{item.addedValue}</del>
												</span>
											) : (
												<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightblue'>
													<del className='replacement'>{item.removedValue}</del>
												</span>
											);

										acc.push(element);
									} else if (!item.added && item.removed) {
										let element =
											paragraphStatus === 'modifying' ? (
												<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
													<del className='deletion'>{item.removedValue}</del>
												</span>
											) : (
												<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
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

				<button
					onClick={() => {
						dispatch(acceptAllAdjustments(paragraphId));
						dispatch(updateParagraphEditDate(paragraphId));
					}}
					disabled={allAdjustmentsCount === 0 || isGrammarFixesPending || isGrammarFixesFetching}
				>
					{paragraphStatus === 'modifying' && 'Accept All'}
					{paragraphStatus === 'reviving' && 'Revert All'}
				</button>
				<button
					onClick={() => {
						// to make sure the next time, paragraph changed back to old content, there will be a refetch
						QueryClient.invalidateQueries({
							queryKey: grammarQueryKeys(paragraphBeforeGrammarFix, paragraphId),
							exact: true,
							refetchType: 'none',
						});
						dispatch(doneWithCurrentParagraphState(paragraphId));
					}}
					disabled={isGrammarFixesPending || isGrammarFixesFetching}
					ref={doneButtonRef}
				>
					Done
				</button>
				{modal.showModal && <Modal />}
			</>
		);
	}
	// -------------- Done Modification --------------
	if (paragraphStatus === 'doneModification') {
		return (
			<>
				<h4>Click Paragraph to Edit</h4>
				<StyledParagraph onClick={() => dispatch(updateUserInput(paragraphId))}>{paragraphAfterGrammarFix}</StyledParagraph>
				{showTranslation && (
					<ErrorBoundary
						onReset={reset}
						fallbackRender={({ resetErrorBoundary }) => (
							<div>
								<StyledParagraph>There was an error!</StyledParagraph>
								<button onClick={() => resetErrorBoundary()}>Try again</button>
							</div>
						)}
					>
						<ParagraphTranslation paragraph={{ paragraphText: paragraphAfterGrammarFix, paragraphId }} />
					</ErrorBoundary>
				)}
				<div>
					<button onClick={() => dispatch(checkEditHistory(paragraphId))} disabled={paragraphAfterGrammarFix === initialParagraph}>
						Show Edit History
					</button>
					<button
						onClick={() => {
							dispatch(revertToBeginning(paragraphId));
							dispatch(updateParagraphEditDate(paragraphId));
						}}
						disabled={paragraphAfterGrammarFix === initialParagraph}
					>
						Revert All Changes
					</button>
					<button
						onClick={() => {
							QueryClient.invalidateQueries({
								queryKey: grammarQueryKeys(paragraphBeforeGrammarFix, paragraphId),
								exact: true,
							});
							dispatch(reFetchGrammarMistakes(paragraphId));
						}}
					>
						Find Grammar Mistakes
					</button>
					<button
						onClick={() => {
							if (showTranslation) {
								QueryClient.cancelQueries({ queryKey: translationQueryKeys(paragraphAfterGrammarFix, paragraphId) });
							}
							dispatch(toggleTranslation(paragraphId));
							reset();
						}}
					>
						{!showTranslation ? 'Show Translation' : 'Hide Translation'}
					</button>
				</div>
			</>
		);
	}
};

export var StyledParagraph = styled.p`
	letter-spacing: 2px;
	font-size: 1.6rem;
	border: 1px solid #ccc;
	margin-bottom: 1rem;

	.insert {
		background-color: lightgreen;
	}

	.replacement {
		background-color: lightblue;
	}

	.deletion {
		background-color: lightcoral;
	}
`;
