import { useRef } from 'react';
import { toast, Id } from 'react-toastify';
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
import { createToast, useKeys, HotkeyMapData } from '../utils';
import { Button } from '../styles';

interface UndoProps {
	onUndo: () => void;
	closeToast: () => void;
}

var Undo = ({ closeToast, onUndo }: UndoProps) => {
	const handleClick = () => {
		onUndo();
		closeToast();
	};

	let { 'Article Page': articlePageHotkeys } = HotkeyMapData();

	useKeys({ keyBinding: articlePageHotkeys.undoArticleDeletion.hotkey, callback: handleClick });

	return (
		<div>
			Deleting Current Article{' '}
			<button onClick={handleClick} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.undoArticleDeletion.label}>
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
					/* v8 ignore next 3 */
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
				/>
			),
			options: { hideProgressBar: false, closeOnClick: false, closeButton: false },
			toastId: `articleDeletion${articleId}`,
		});

		/* v8 ignore next 7 */
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

	let { 'Article Page': articlePageHotkeys } = HotkeyMapData();

	// delete article hotkey
	useKeys({ keyBinding: articlePageHotkeys.deleteArticle.hotkey, callback: handleArticleDeletion });

	// preview article hotkey
	/* v8 ignore next 6 */
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
		<>
			<Button onClick={handlePinArticle} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.pinArticle.label}>
				{articleIsInFavorites ? 'Unpin' : 'Pin'}
			</Button>
			<Button onClick={handleArticleDeletion} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.deleteArticle.label}>
				Delete Article
			</Button>
			<Button>
				<Link
					to={`/article/${articleId}/preview`}
					data-tooltip-id='hotkey'
					data-tooltip-content={articlePageHotkeys.previewArticle.label}
					tabIndex={-1} // remove underlying a tag from tabbing sequence
				>
					Preview Article
				</Link>
			</Button>
		</>
	);
};
