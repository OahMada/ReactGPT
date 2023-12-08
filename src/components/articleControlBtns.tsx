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
import { createToast, useKeys, hotkeyMap } from '../utils';

interface UndoProps extends Partial<ToastContentProps> {
	onUndo: () => void;
	closeToast: () => void;
}

var { articlePage: articlePageHotkeys } = hotkeyMap;

var Undo = ({ closeToast, onUndo }: UndoProps) => {
	const handleClick = () => {
		onUndo();
		closeToast();
	};

	useKeys({ keyBinding: articlePageHotkeys.undoDeletion.hotkey, callback: handleClick });

	return (
		<div>
			Deleting Current Article{' '}
			<button onClick={handleClick} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.undoDeletion.label}>
				UNDO
			</button>
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
			toastId: `articleDeletion${articleId}`,
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
	let handlePinArticle = () => {
		if (articleIsInFavorites) {
			dispatch(unPinArticle(articleId));
		} else {
			dispatch(pinArticle(articleId));
		}
	};

	// delete article hotkey
	useKeys({ keyBinding: articlePageHotkeys.deleteArticle.hotkey, callback: handleArticleDeletion });

	// preview article hotkey
	useKeys({
		keyBinding: articlePageHotkeys.previewArticle.hotkey,
		callback: () => {
			navigate(`/article/${articleId}/preview`);
		},
	});

	// pin article hotkey
	useKeys({
		keyBinding: articlePageHotkeys.pinArticle.hotkey,
		callback: handlePinArticle,
	});

	return (
		<div>
			<button onClick={handlePinArticle} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.pinArticle.label}>
				{articleIsInFavorites ? 'Unpin' : 'Pin'}
			</button>
			<button onClick={handleArticleDeletion} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.deleteArticle.label}>
				Delete Article
			</button>
			<button>
				<Link to={`/article/${articleId}/preview`} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.previewArticle.label}>
					Preview Article
				</Link>
			</button>
		</div>
	);
};
