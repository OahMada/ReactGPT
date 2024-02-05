import styled from 'styled-components';

// redux
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { showModal, hideModal, selectModal } from '../features/modalSlice';
import { acceptSingleAdjustment, ignoreSingleAdjustment, updateParagraphEditDate } from '../features/articleSlice';

type CustomCSS = React.CSSProperties & Record<`--${string}`, string | number>;

export var Modal = () => {
	let dispatch = useAppDispatch();
	let { title, content, dimension, color, indexInParagraph, paragraphStatus, paragraphId, displayModal } = useAppSelector(selectModal);

	// 0.8 & 6.5 here is fixed
	return (
		<Wrapper
			/* v8 ignore next 3 */
			onMouseLeave={() => {
				dispatch(hideModal());
			}}
			onMouseEnter={() => {
				dispatch(showModal());
			}}
			style={
				{
					'--color': color,
					'--position-left': dimension.left,
					'--position-top': dimension.top,
				} as CustomCSS // https://stackoverflow.com/a/65959390/5800789 https://www.joshwcomeau.com/css/styled-components/#css-variables-1
			}
			$displayModal={displayModal}
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
						dispatch(updateParagraphEditDate(paragraphId));
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
							dispatch(updateParagraphEditDate(paragraphId));
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

var Wrapper = styled.div<{ $displayModal: boolean }>`
	position: fixed;
	top: calc(var(--position-top) * 1px - 6.5rem);
	left: calc(var(--position-left) * 1px - 0.8rem);
	display: ${({ $displayModal }) => ($displayModal ? 'flex' : 'none')};
	width: fit-content;
	flex-direction: column;
	justify-content: space-around;
	padding: 0.8rem;
	border: 1px solid black;
	border-radius: 5px;
	background-color: white;

	.title {
		font-size: 1.2rem;
		font-weight: 600;
		line-height: 1;
		text-decoration: underline 3px;
		text-decoration-color: var(--color);
	}

	.content {
		margin: 0.5rem 0;
		font-size: 1.5rem;
		line-height: 1;
	}

	.btn-container {
		display: flex;
		justify-content: space-between;
		margin-top: 3px;
		gap: 5px;
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
