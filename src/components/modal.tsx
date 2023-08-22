import styles from './modal.module.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';

import { showModal, hideModal, ModalType } from '../features/modal/modalSlice';
import { acceptSingleAdjustment, ignoreSingleAdjustment, selectArticle } from '../features/article/articleSlice';

// import { useEffect, useRef } from 'react';

var Modal = ({ title, content, dimension, color, indexInArticle }: ModalType) => {
	let article = useAppSelector(selectArticle);

	let dispatch = useAppDispatch();

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
				<cite>{content === ' ' ? <i>{'[space]'}</i> : content}</cite>
			</p>
			{article.status === 'reviving' ? (
				<button
					className={`${styles['accept-btn']} ${styles['btn']}`}
					onClick={() => {
						dispatch(acceptSingleAdjustment(indexInArticle));
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
							dispatch(acceptSingleAdjustment(indexInArticle));
							dispatch(hideModal());
						}}
					>
						ACCEPT
					</button>
					<button
						className={`${styles['ignore-btn']} ${styles['btn']}`}
						onClick={() => {
							dispatch(ignoreSingleAdjustment(indexInArticle));
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
