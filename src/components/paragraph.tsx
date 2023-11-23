import styled from 'styled-components';
import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { refactoredChange, Paragraph as ParagraphType, EditHistoryMode } from '../types';

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
} from '../features/articleSlice';
import { updateModalContent, showModal, hideModal, selectModal } from '../features/modalSlice';

import { Modal, ParagraphInput, ParagraphTranslation } from '.';

export var Paragraph = ({
	paragraph: {
		id,
		initialParagraph,
		updatedInitialParagraph,
		paragraphBeforeGrammarFix,
		paragraphAfterGrammarFix,
		adjustmentObjectArr,
		allAdjustmentsCount,
		paragraphStatus,
		editHistoryMode,
		showTranslation,
	},
}: {
	paragraph: ParagraphType;
}) => {
	let doneButtonRef = useRef<HTMLButtonElement>(null);

	// dispatch
	let dispatch = useAppDispatch();

	// fetch API
	// isGrammarFixesFetching is for action initiated by click the fix grammar mistakes button
	let { isPending: isGrammarFixesPending, isFetching: isGrammarFixesFetching } = useGrammarQuery(paragraphBeforeGrammarFix, id);

	// query client
	let QueryClient = useQueryClient();
	let { reset } = useQueryErrorResetBoundary();

	// state values
	let modal = useAppSelector(selectModal);

	// handlers
	let onMouseEnterHandler = (e: React.MouseEvent<HTMLElement>, item: refactoredChange, index: number) => {
		let { left, top } = e.currentTarget.getBoundingClientRect();
		// target is whatever you actually clicked on. It can vary, as this can be within an element that the event was bound to.
		// currentTarget is the element you actually bound the event to. This will never change.
		let color = e.currentTarget.dataset.color!;
		dispatch(updateModalContent({ modifiedObj: item, dimension: { left, top }, color, indexInParagraph: index, paragraphStatus, paragraphId: id }));
		dispatch(showModal());
	};

	let mouseLeaveHandler = () => {
		dispatch(hideModal());
	};

	let handleEditHistoryMode = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(alterCheckEditHistoryMode({ paragraphId: id, mode: e.target.value as EditHistoryMode }));
		dispatch(checkEditHistory(id));
	};

	// automatically click the done button a certain condition
	toast.onChange((toastItem) => {
		if (toastItem.status === 'removed' && toastItem.id === id + 'NoGrammarMistakes' && paragraphStatus === 'modifying') {
			// If the toastId check isn't included, changes to any toast would trigger the following.
			if (doneButtonRef.current) {
				doneButtonRef.current!.click();
			}
		}
	});

	// -------------- Editing--------------

	if (paragraphStatus === 'editing') {
		return <ParagraphInput paragraphId={id} />;
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
								id={`${id}Creation`}
								name={id}
								value='paragraphCreation'
								checked={editHistoryMode === 'paragraphCreation'}
								onChange={handleEditHistoryMode}
							/>
							<label htmlFor={`${id}Creation`}>Since Paragraph Creation</label>
						</div>
						<div>
							<input
								type='radio'
								id={`${id}LastEdit`}
								name={id}
								value='paragraphLastEdit'
								checked={editHistoryMode === 'paragraphLastEdit'}
								onChange={handleEditHistoryMode}
								disabled={initialParagraph === updatedInitialParagraph}
							/>
							<label htmlFor={`${id}LastEdit`}>Since Paragraph Last Edit</label>
						</div>
					</fieldset>
				)}
				{isGrammarFixesPending || isGrammarFixesFetching ? (
					<StyledParagraph>{paragraphBeforeGrammarFix}</StyledParagraph>
				) : (
					<StyledParagraph>
						{...adjustmentObjectArr.reduce<React.ReactNode[]>((acc, item, index) => {
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
						}, [])}
					</StyledParagraph>
				)}

				<button
					onClick={() => {
						dispatch(acceptAllAdjustments(id));
						dispatch(updateParagraphEditDate(id));
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
							queryKey: grammarQueryKeys(paragraphBeforeGrammarFix, id),
							exact: true,
							refetchType: 'none',
						});
						dispatch(doneWithCurrentParagraphState(id));
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
				<StyledParagraph onClick={() => dispatch(updateUserInput(id))}>{paragraphAfterGrammarFix}</StyledParagraph>
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
						<ParagraphTranslation paragraph={{ paragraphText: paragraphAfterGrammarFix, paragraphId: id }} />
					</ErrorBoundary>
				)}
				<div>
					<button onClick={() => dispatch(checkEditHistory(id))} disabled={paragraphAfterGrammarFix === initialParagraph}>
						Show Edit History
					</button>
					<button
						onClick={() => {
							dispatch(revertToBeginning(id));
							dispatch(updateParagraphEditDate(id));
						}}
						disabled={paragraphAfterGrammarFix === initialParagraph}
					>
						Revert All Changes
					</button>
					<button
						onClick={() => {
							QueryClient.invalidateQueries({
								queryKey: grammarQueryKeys(paragraphBeforeGrammarFix, id),
								exact: true,
							});
							dispatch(reFetchGrammarMistakes(id));
						}}
					>
						Find Grammar Mistakes
					</button>
					<button
						onClick={() => {
							if (showTranslation) {
								QueryClient.cancelQueries({ queryKey: translationQueryKeys(paragraphAfterGrammarFix, id) });
							}
							dispatch(toggleTranslation(id));
							reset();
						}}
					>
						{
							// TODO a tricky bug here, maybe consider use local state
							!showTranslation ? 'Show Translation' : 'Hide Translation'
						}
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
