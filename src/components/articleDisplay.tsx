import { RootState } from '../app/store';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import Modal from './modal';
import {
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentArticleState,
	revertToBeginning,
	selectArticle,
	reFetchGrammarMistakes,
	updateUserInput,
} from '../features/article/articleSlice';
import styles from './articleDisplay.module.css';
import { updateModalContent, showModal, hideModal } from '../features/modal/modalSlice';
import { refactoredChange } from '../types';

export var ArticleDisplay = () => {
	// state values
	let article = useAppSelector(selectArticle);
	let modal = useAppSelector((state: RootState) => state.modal);

	// dispatch
	let dispatch = useAppDispatch();

	// handlers
	let onMouseEnterHandler = (e: React.MouseEvent<HTMLElement>, item: refactoredChange, index: number) => {
		let { left, top } = e.currentTarget.getBoundingClientRect();
		let color = e.currentTarget.dataset.color!;
		dispatch(updateModalContent({ modifiedObj: item, dimension: { left, top }, color, indexInArticle: index, articleStatus: article.status }));
		dispatch(showModal());
	};

	let mouseLeaveHandler = () => {
		dispatch(hideModal());
	};

	if (article.initialArticle && article.fixGrammarLoading === 'loading') {
		return <p className={styles.article}>{article.initialArticle}</p>;
	}
	if ((article.fixGrammarLoading === 'done' && article.status === 'modifying') || article.status === 'reviving') {
		return (
			<>
				<p className={styles.article}>
					{...article.adjustmentObjectArr.reduce<React.ReactNode[]>((acc, item, index) => {
						if (item.value) {
							acc.push(item.value);
						} else if (item.removed || item.added) {
							if (item.added && !item.removed) {
								let element =
									article.status === 'modifying' ? (
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
									article.status === 'modifying' ? (
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
				{modal.showModal && <Modal {...modal} />}
				{article.status === 'modifying' && (
					<button
						onClick={() => {
							dispatch(acceptAllAdjustments());
						}}
					>
						Accept All
					</button>
				)}
				{article.status === 'reviving' && (
					<button
						onClick={() => {
							dispatch(acceptAllAdjustments());
						}}
					>
						Revert All
					</button>
				)}
				<button
					onClick={() => {
						dispatch(doneWithCurrentArticleState());
					}}
				>
					Done
				</button>
			</>
		);
	}
	if (article.status === 'doneModification') {
		return (
			<>
				<p className={styles.article} onClick={() => dispatch(updateUserInput())}>
					{article.grammarFixedArticle}{' '}
				</p>
				<div className={styles['btn-container']}>
					<>
						<button onClick={() => dispatch(checkEditHistory())} disabled={article.grammarFixedArticle === article.initialArticle}>
							Show Edit History
						</button>
						<button
							onClick={() => {
								dispatch(revertToBeginning());
							}}
							disabled={article.grammarFixedArticle === article.initialArticle}
						>
							Revert All Changes
						</button>
						<button
							onClick={() => {
								dispatch(reFetchGrammarMistakes());
							}}
							disabled={article.fixGrammarLoading !== 'done'}
						>
							Find Grammar Mistakes
						</button>
					</>
				</div>
			</>
		);
	}
};
