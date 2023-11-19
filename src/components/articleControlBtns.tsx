import { useRef } from 'react';
import { toast, Id, ToastContentProps } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
	removeArticle,
	addArticleToDeletionQueue,
	removeArticleFromDeletionQueue,
	selectArticle,
	pinArticle,
	unPinArticle,
} from '../features/articleSlice';
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

export var ArticleControlBtns = ({ articleId }: { articleId: string }) => {
	let { articleQueue } = useAppSelector(selectArticle);
	let toastId = useRef<Id>();
	let dispatch = useAppDispatch();
	let navigate = useNavigate();

	let handleArticleDeletion = () => {
		dispatch(addArticleToDeletionQueue(articleId));
		navigate('/');

		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						dispatch(removeArticleFromDeletionQueue(articleId));
						navigate(`/article/${articleId}`);
					}}
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
				/>
			),
			containerId: 'articleDeletion',
			options: { hideProgressBar: false },
		});

		toast.onChange((toastItem) => {
			if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
				// only navigate when the article did get deleted
				dispatch(removeArticle(articleId));
				dispatch(removeArticleFromDeletionQueue(articleId));
			}
		});
	};

	let articleIsInFavorites = articleQueue.favorites.indexOf(articleId) !== -1 ? true : false;

	return (
		<div>
			{articleIsInFavorites ? (
				<button
					onClick={() => {
						dispatch(unPinArticle(articleId));
					}}
				>
					Unpin
				</button>
			) : (
				<button
					onClick={() => {
						dispatch(pinArticle(articleId));
					}}
				>
					Pin
				</button>
			)}
			<button onClick={handleArticleDeletion}>Delete Article</button>
			<button>
				<Link to={`/article/${articleId}/preview`}>Preview Article</Link>
			</button>
			{/* TODO */}
		</div>
	);
};
