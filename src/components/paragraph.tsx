import { useAppSelector, useAppDispatch } from '../app/hooks';
import { refactoredChange } from '../types';
import { updateModalContent, showModal, hideModal } from '../features/modal/modalSlice';
import styles from './articleDisplay.module.css';
import { selectArticle } from '../features/article/articleSlice';

const Paragraph = () => {
	let article = useAppSelector(selectArticle);
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

	return (
		<p className={styles.article}>
			{...article.adjustmentObjectArr.map<React.ReactNode>((item, index) => {
				if (item.value) {
					return item.value;
				} else if (item.removed || item.added) {
					if (item.added && !item.removed) {
						return article.status === 'modifying' ? (
							<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
								<ins className={styles.insert}>{item.addedValue}</ins>
							</span>
						) : (
							<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
								<del className={styles.deletion}>{item.addedValue}</del>
							</span>
						);
					} else if (item.added && item.removed) {
						return (
							<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightblue'>
								<del className={styles.replacement}>{item.removedValue}</del>
							</span>
						);
					} else if (!item.added && item.removed) {
						return article.status === 'modifying' ? (
							<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightcoral'>
								<del className={styles.deletion}>{item.removedValue}</del>
							</span>
						) : (
							<span onMouseEnter={(e) => onMouseEnterHandler(e, item, index)} onMouseLeave={mouseLeaveHandler} data-color='lightgreen'>
								<ins className={styles.insert}>{item.removedValue}</ins>
							</span>
						);
					}
				}
			})}
		</p>
	);
};
export default Paragraph;
