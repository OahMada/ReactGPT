import { deleteParagraphs, insertAboveParagraph, insertBelowParagraph } from '../features/articleSlice';
import { useAppDispatch } from '../app/hooks';
import { toast, ToastContainer } from 'react-toastify';

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

	let handleParagraphDeletion = () => {
		dispatch(deleteParagraphs(paragraphId));
		toast(<Undo onUndo={() => {}} closeToast={() => {}} />, {});
	};
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
