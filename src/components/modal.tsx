import styles from './modal.module.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';

import { showModal, hideModal, selectModal } from '../features/modal/modalSlice';
import { acceptSingleAdjustment, ignoreSingleAdjustment } from '../features/article/articleSlice';

var Modal = () => {
	let dispatch = useAppDispatch();
	let { title, content, dimension, color, indexInParagraph, paragraphStatus, paragraphId } = useAppSelector(selectModal);

	// 0.8 & 6.5 here is fixed
	return (
		<div
			className={styles.container}
			style={{ left: `calc( ${dimension.left}px - 0.8rem)`, top: `calc( ${dimension.top}px - 6.5rem) ` }}
			onMouseLeave={() => {
				dispatch(hideModal());
			}}
			onMouseEnter={() => {
				dispatch(showModal());
			}}
		>
			<h4 className={styles.title} style={{ textDecorationColor: color }}>
				{title.toUpperCase()}
			</h4>
			<p className={styles.content}>
				{/* indicate white spaces that are ought to adjust */}
				<cite>{content === ' ' ? <i>{'[space]'}</i> : content}</cite>
			</p>
			{paragraphStatus === 'reviving' ? (
				<button
					className={`${styles['accept-btn']} ${styles['btn']}`}
					onClick={() => {
						dispatch(acceptSingleAdjustment({ indexInParagraph, paragraphId }));
						dispatch(hideModal());
					}}
				>
					REVERT
				</button>
			) : (
				<div className={styles['btn-container']}>
					<button
						className={`${styles['accept-btn']} ${styles['btn']}`}
						onClick={() => {
							dispatch(acceptSingleAdjustment({ indexInParagraph, paragraphId }));
							dispatch(hideModal());
						}}
					>
						ACCEPT
					</button>
					<button
						className={`${styles['ignore-btn']} ${styles['btn']}`}
						onClick={() => {
							dispatch(ignoreSingleAdjustment({ indexInParagraph, paragraphId }));
							dispatch(hideModal());
						}}
					>
						IGNORE
					</button>
				</div>
			)}
		</div>
	);
};
export default Modal;
