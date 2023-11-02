import { useRef } from 'react';
import { toast, Id, ToastContentProps } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { removeArticle, addArticleToDeletionQueue, undoArticleDeletion, selectArticle } from '../features/articleSlice';
import { createToast } from '../utils';

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
			Deleting Current Article <button onClick={handleClick}>UNDO</button>
		</div>
	);
};

var ArticleControlBtns = ({ articleId }: { articleId: string }) => {
	let { articleRemoveQueue } = useAppSelector(selectArticle);
	let toastId = useRef<Id>();
	let dispatch = useAppDispatch();
	let navigate = useNavigate();

	let handleArticleDeletion = () => {
		dispatch(addArticleToDeletionQueue(articleId));

		toast.onChange((toastItem) => {
			if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
				dispatch(removeArticle({ articleId, mode: 'explicit' }));
				if (articleRemoveQueue.includes(articleId)) {
					// only navigate when the article did get deleted
					navigate('/');
				}
			}
		});

		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						dispatch(undoArticleDeletion(articleId));
					}}
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
				/>
			),
			containerId: 'paragraphDeletion',
			options: { hideProgressBar: false },
		});
	};

	return (
		<div>
			<button onClick={handleArticleDeletion}>Delete Article</button>
			<button>Preview Article</button>
			{/* TODO */}
		</div>
	);
};
export default ArticleControlBtns;
