import { useRef } from 'react';
import { toast, Id, ToastContentProps } from 'react-toastify';

import {
	deleteParagraph,
	insertAboveParagraph,
	insertBelowParagraph,
	addParagraphToDeletionQueue,
	undoParagraphDeletion,
} from '../features/articleSlice';
import { useAppDispatch } from '../app/hooks';
import { createToast } from '../utils';

// https://github.com/fkhadra/react-toastify/issues/568#issuecomment-779847274
interface UndoProps extends Partial<ToastContentProps> {
	onUndo: () => void;
	closeToast: () => void;
}

var Undo = ({ closeToast, onUndo }: UndoProps) => {
	const handleClick = () => {
		onUndo();
		closeToast();
	};

	return (
		<div>
			Paragraph Deleted <button onClick={handleClick}>UNDO</button>
		</div>
	);
};

var ParagraphControlBtns = ({ paragraphId }: { paragraphId: string }) => {
	let dispatch = useAppDispatch();
	let toastId = useRef<Id>();

	let handleParagraphDeletion = () => {
		dispatch(addParagraphToDeletionQueue(paragraphId));

		toast.onChange((toastItem) => {
			if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
				// If the toastId check isn't included, changes to any toast would trigger the following.
				dispatch(deleteParagraph(paragraphId));
			}
		});

		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						dispatch(undoParagraphDeletion(paragraphId));
					}}
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
				/>
			),
			containerId: 'paragraphDeletion',
			options: { hideProgressBar: true },
		});
	};

	return (
		<div>
			<button onClick={handleParagraphDeletion}>Delete Paragraph</button>
			<div>
				<button>Insert New Paragraph</button>
				<button onClick={() => dispatch(insertAboveParagraph(paragraphId))}>Insert Above</button>
				<button onClick={() => dispatch(insertBelowParagraph(paragraphId))}>Insert Bellow</button>
			</div>
		</div>
	);
};

export default ParagraphControlBtns;
