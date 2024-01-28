import styled from 'styled-components';

// redux
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { showModal, hideModal, selectModal } from '../features/modalSlice';
import { acceptSingleAdjustment, ignoreSingleAdjustment, updateParagraphEditDate } from '../features/articleSlice';

// for the purpose of https://styled-components.com/docs/faqs#shouldforwardprop-is-no-longer-provided-by-default
// the warning said: Warning: React does not recognize the `positionTop` prop on a DOM element...
import isPropValid from '@emotion/is-prop-valid';
import { StyleSheetManager } from 'styled-components';

export var Modal = () => {
	let dispatch = useAppDispatch();
	let { title, content, dimension, color, indexInParagraph, paragraphStatus, paragraphId } = useAppSelector(selectModal);

	// 0.8 & 6.5 here is fixed
	return (
		<StyleSheetManager shouldForwardProp={isPropValid}>
			<Wrapper
				/* v8 ignore next 3 */
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
		</StyleSheetManager>
	);
};

var Wrapper = styled.div<{ titleColor: string; positionLeft: number; positionTop: number }>`
	position: fixed;
	top: ${(props) => `calc( ${props.positionTop}px - 6.5rem) `};
	left: ${(props) => `calc( ${props.positionLeft}px - 0.8rem)`};
	display: flex;
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
