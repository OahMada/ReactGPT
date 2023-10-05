import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';

import { showModal, hideModal, selectModal } from '../features/modalSlice';
import { acceptSingleAdjustment, ignoreSingleAdjustment } from '../features/articleSlice';

var Modal = () => {
	let dispatch = useAppDispatch();
	let { title, content, dimension, color, indexInParagraph, paragraphStatus, paragraphId } = useAppSelector(selectModal);

	// 0.8 & 6.5 here is fixed
	return (
		<Wrapper
			onMouseLeave={() => {
				dispatch(hideModal());
			}}
			onMouseEnter={() => {
				dispatch(showModal());
			}}
			titleColor={color}
			positionLeft={dimension.left}
			positionTop={dimension.top}
		>
			<h4 className='title'>{title.toUpperCase()}</h4>
			<p className='content'>
				{/* indicate white spaces that are ought to adjust */}
				<cite>{content === ' ' ? <i>{'[space]'}</i> : content}</cite>
			</p>
			{paragraphStatus === 'reviving' ? (
				<button
					className='accept-btn btn'
					onClick={() => {
						dispatch(acceptSingleAdjustment({ indexInParagraph, paragraphId }));
						dispatch(hideModal());
					}}
				>
					REVERT
				</button>
			) : (
				<div className='btn-container'>
					<button
						className='accept-btn btn'
						onClick={() => {
							dispatch(acceptSingleAdjustment({ indexInParagraph, paragraphId }));
							dispatch(hideModal());
						}}
					>
						ACCEPT
					</button>
					<button
						className='ignore-btn btn'
						onClick={() => {
							dispatch(ignoreSingleAdjustment({ indexInParagraph, paragraphId }));
							dispatch(hideModal());
						}}
					>
						IGNORE
					</button>
				</div>
			)}
		</Wrapper>
	);
};
export default Modal;

// TODO bug here

var Wrapper = styled.div<{ titleColor: string; positionLeft: number; positionTop: number }>`
	padding: 0.8rem;
	border-radius: 5px;
	border: 1px solid black;
	width: fit-content;
	position: fixed;
	background-color: white;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	left: ${(props) => `calc( ${props.positionLeft}px - 0.8rem)`};
	top: ${(props) => `calc( ${props.positionTop}px - 6.5rem) `};

	.title {
		font-size: 1.2rem;
		font-weight: 600;
		line-height: 1;
		text-decoration: underline 3px;
		text-decoration-color: ${(props) => props.titleColor};
	}

	.content {
		margin: 0.5rem 0;
		font-size: 1.5rem;
		line-height: 1;
	}

	.btn-container {
		display: flex;
		justify-content: space-between;
		gap: 5px;
		margin-top: 3px;
	}

	.btn {
		border: none;
		background-color: transparent;
		font-size: 1rem;
	}

	.accept-btn {
		color: green;
	}

	.ignore-btn {
		color: gray;
	}
`;
