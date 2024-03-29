import { forwardRef } from 'react';

// redux
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { showModal, hideModal, selectModal } from '../../features/modalSlice';
import { acceptSingleAdjustment, ignoreSingleAdjustment, updateParagraphEditDate } from '../../features/articleSlice';
import { Button } from '../../styled/button';
import { ModalWrapper } from './modalWrapper';

type CustomCSS = React.CSSProperties & Record<`--${string}`, string | number>;

export var Modal = forwardRef<HTMLDivElement, { modalOffsets: { top: number; left: number } }>(({ modalOffsets }, ref) => {
	let dispatch = useAppDispatch();
	let { title, content, dimension, color, indexInParagraph, paragraphStatus, paragraphId, displayModal } = useAppSelector(selectModal);

	// 0.8 & 6.5 here is fixed
	return (
		<ModalWrapper
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
					'--position-top-offset': modalOffsets.top,
				} as CustomCSS // https://stackoverflow.com/a/65959390/5800789 https://www.joshwcomeau.com/css/styled-components/#css-variables-1
			}
			$displayModal={displayModal}
			$leftOffset={modalOffsets.left}
			ref={ref}
		>
			<h4 className='title'>{title.toUpperCase()}</h4>
			<p className='content'>
				{/* indicate white spaces that are ought to adjust */}
				<cite>{content === ' ' ? <i>{'[space]'}</i> : content}</cite>
			</p>
			<div className='btn-container'>
				{paragraphStatus === 'reviving' ? (
					<Button
						className='accept-btn'
						onClick={() => {
							dispatch(acceptSingleAdjustment({ indexInParagraph, paragraphId }));
							dispatch(updateParagraphEditDate(paragraphId));
							dispatch(hideModal());
						}}
					>
						REVERT
					</Button>
				) : (
					<>
						<Button
							className='accept-btn'
							onClick={() => {
								dispatch(acceptSingleAdjustment({ indexInParagraph, paragraphId }));
								dispatch(updateParagraphEditDate(paragraphId));
								dispatch(hideModal());
							}}
						>
							ACCEPT
						</Button>
						<Button
							className='ignore-btn'
							onClick={() => {
								dispatch(ignoreSingleAdjustment({ indexInParagraph, paragraphId }));
								dispatch(hideModal());
							}}
						>
							IGNORE
						</Button>
					</>
				)}
			</div>
		</ModalWrapper>
	);
});
