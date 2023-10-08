import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';

import { refactoredChange } from '../types';

import { useGPT, gptKeys } from '../query/GPT';

import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentParagraphState,
	revertToBeginning,
	reFetchGrammarMistakes,
	updateUserInput,
	Paragraph as ParagraphType,
} from '../features/articleSlice';
import { updateModalContent, showModal, hideModal, selectModal } from '../features/modalSlice';

import Modal from './modal';
import UserInput from './userInput';

var Paragraph = ({
	paragraph: { id, initialParagraph, paragraphBeforeGrammarFix, paragraphAfterGrammarFix, adjustmentObjectArr, allAdjustmentsCount, paragraphStatus },
}: {
	paragraph: ParagraphType;
}) => {
	// dispatch
	let dispatch = useAppDispatch();

	// fetch API
	// isFetching is for action initiated by click the fix grammar mistakes button
	let { isLoading, isFetching } = useGPT(paragraphBeforeGrammarFix);

	// query client
	let QueryClient = useQueryClient();

	// state values
	let modal = useAppSelector(selectModal);

	// handlers
	let onMouseEnterHandler = (e: React.MouseEvent<HTMLElement>, item: refactoredChange, index: number) => {
		let { left, top } = e.currentTarget.getBoundingClientRect();
		let color = e.currentTarget.dataset.color!;
		dispatch(updateModalContent({ modifiedObj: item, dimension: { left, top }, color, indexInParagraph: index, paragraphStatus, paragraphId: id }));
		dispatch(showModal());
	};

	let mouseLeaveHandler = () => {
		dispatch(hideModal());
	};

	if (paragraphStatus === 'editing') {
		return <UserInput paragraphId={id} />;
	}

	if (paragraphStatus === 'modifying' || paragraphStatus === 'reviving') {
		return (
			<>
				{isLoading || isFetching ? (
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
									let element = (
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
					}}
					disabled={allAdjustmentsCount === 0 || isLoading || isFetching} // TODO show notification here if no error
				>
					{paragraphStatus === 'modifying' && 'Accept All'}
					{paragraphStatus === 'reviving' && 'Revert All'}
				</button>
				<button
					onClick={() => {
						dispatch(doneWithCurrentParagraphState(id));
					}}
					disabled={isLoading || isFetching}
				>
					Done
				</button>
				{modal.showModal && <Modal />}
			</>
		);
	}
	if (paragraphStatus === 'doneModification') {
		return (
			<>
				<h4>Click Paragraph to Edit</h4>
				<StyledParagraph onClick={() => dispatch(updateUserInput(id))}>{paragraphAfterGrammarFix}</StyledParagraph>
				<div>
					<button onClick={() => dispatch(checkEditHistory(id))} disabled={paragraphAfterGrammarFix === initialParagraph}>
						Show Edit History
					</button>
					<button
						onClick={() => {
							dispatch(revertToBeginning(id));
						}}
						disabled={paragraphAfterGrammarFix === initialParagraph}
					>
						Revert All Changes
					</button>
					<button
						onClick={() => {
							QueryClient.invalidateQueries({
								queryKey: gptKeys(paragraphBeforeGrammarFix),
								exact: true,
							});
							dispatch(reFetchGrammarMistakes(id));
						}}
					>
						Find Grammar Mistakes
					</button>
				</div>
			</>
		);
	}
};
export default Paragraph;

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
