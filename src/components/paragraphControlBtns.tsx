import { useRef } from 'react';
import { toast, ToastContainer, Id } from 'react-toastify';

import {
	deleteParagraphs,
	insertAboveParagraph,
	insertBelowParagraph,
	addParagraphToDeletionQueue,
	undoParagraphDeletion,
} from '../features/articleSlice';
import { useAppDispatch } from '../app/hooks';
import { createToast } from '../utils';

interface UndoProps {
	onUndo: () => void;
	closeToast: () => void;
}

var Undo = ({ onUndo, closeToast }: UndoProps) => {
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
		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						console.log('undo');
						dispatch(undoParagraphDeletion(paragraphId));
					}}
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
				/>
			),
		});
	};

	let unsubscribe = toast.onChange((toastItem) => {
		if (toastItem.status === 'removed') {
			dispatch(deleteParagraphs(paragraphId));
		}
	});

	// unsubscribe();

	return (
		<div>
			<button onClick={handleParagraphDeletion}>Delete Paragraph</button>
			<div>
				<button>Insert New Paragraph</button>
				<button onClick={() => dispatch(insertAboveParagraph(paragraphId))}>Insert Above</button>
				<button onClick={() => dispatch(insertBelowParagraph(paragraphId))}>Insert Bellow</button>
			</div>
			<ToastContainer closeOnClick={false} closeButton={false} />
		</div>
	);
};

export default ParagraphControlBtns;
