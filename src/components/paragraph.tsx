import { refactoredChange } from '../types';
import { useAppSelector, useAppDispatch } from '../app/hooks';

import {
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentParagraphState,
	revertToBeginning,
	reFetchGrammarMistakes,
	updateUserInput,
	Paragraph as ParagraphType,
} from '../features/article/articleSlice';
import { updateModalContent, showModal, hideModal, selectModal } from '../features/modal/modalSlice';

import styles from './paragraph.module.css';

import Modal from './modal';
import UserInput from './userInput';

interface ParagraphPropType {
	paragraph: ParagraphType;
}

var Paragraph = ({
	paragraph: {
		id,
		initialParagraph,
		paragraphBeforeGrammarFix,
		paragraphAfterGrammarFix,
		adjustmentObjectArr,
		fixGrammarLoading,
		allAdjustmentsCount,
		paragraphStatus,
	},
}: ParagraphPropType) => {
	// state values
	let modal = useAppSelector(selectModal);

	// dispatch
	let dispatch = useAppDispatch();

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
				{fixGrammarLoading === 'loading' ? (
					<p className={styles.paragraph}>{paragraphBeforeGrammarFix}</p>
				) : (
					<p className={styles.paragraph}>
						{...adjustmentObjectArr.reduce<React.ReactNode[]>((acc, item, index) => {
							if (item.value) {
								acc.push(item.value);
							} else if (item.removed || item.added) {
								if (item.added && !item.removed) {
									let element =
										paragraphStatus === 'modifying' ? (
											<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
												<ins className={styles.insert}>{item.addedValue}</ins>
											</span>
										) : (
											<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
												<del className={styles.deletion}>{item.addedValue}</del>
											</span>
										);
									acc.push(element);
								} else if (item.added && item.removed) {
									let element = (
										<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightblue'>
											<del className={styles.replacement}>{item.removedValue}</del>
										</span>
									);
									acc.push(element);
								} else if (!item.added && item.removed) {
									let element =
										paragraphStatus === 'modifying' ? (
											<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
												<del className={styles.deletion}>{item.removedValue}</del>
											</span>
										) : (
											<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
												<ins className={styles.insert}>{item.removedValue}</ins>
											</span>
										);
									acc.push(element);
								}
							}
							return acc;
						}, [])}
					</p>
				)}
				{modal.showModal && <Modal />}
				<button
					onClick={() => {
						dispatch(acceptAllAdjustments(id));
					}}
					disabled={allAdjustmentsCount === 0 || fixGrammarLoading === 'loading'} // TODO show notification here if no error
				>
					{paragraphStatus === 'modifying' && 'Accept All'}
					{paragraphStatus === 'reviving' && 'Revert All'}
				</button>
				<button
					onClick={() => {
						dispatch(doneWithCurrentParagraphState(id));
					}}
					disabled={fixGrammarLoading === 'loading'}
				>
					Done
				</button>
			</>
		);
	}
	if (paragraphStatus === 'doneModification') {
		return (
			<>
				<h4>Click Paragraph to Edit</h4>
				<p className={styles.paragraph} onClick={() => dispatch(updateUserInput(id))}>
					{paragraphAfterGrammarFix}
				</p>
				<div className={styles['btn-container']}>
					<>
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
								dispatch(reFetchGrammarMistakes(id));
							}}
						>
							Find Grammar Mistakes
						</button>
					</>
				</div>
			</>
		);
	}
};
export default Paragraph;