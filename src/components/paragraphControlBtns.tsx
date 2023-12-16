import { useRef } from 'react';
import { toast, Id, ToastContentProps } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useHotkeysContext } from 'react-hotkeys-hook';

import {
	finishParagraphDeletion,
	insertAboveParagraph,
	insertBelowParagraph,
	addParagraphToDeletionQueue,
	undoParagraphDeletion,
	selectArticle,
	updateArticleFirstParagraphEditDate,
} from '../features/articleSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createToast, throwIfUndefined, useKeys, hotkeyMap } from '../utils';
import { Paragraph } from '../types';

// https://github.com/fkhadra/react-toastify/issues/568#issuecomment-779847274
interface UndoProps extends Partial<ToastContentProps> {
	onUndo: () => void;
	closeToast: () => void;
	paragraph: string;
	paragraphId: string;
}

var { 'Article Page': articlePageHotkeys } = hotkeyMap;

var Undo = ({ closeToast, onUndo, paragraph, paragraphId }: UndoProps) => {
	const handleClick = () => {
		onUndo();
		closeToast();
	};

	useKeys({
		keyBinding: articlePageHotkeys.undoParagraphDeletion.hotkey,
		callback: handleClick,
		scopes: paragraphId,
	});

	let { enabledScopes } = useHotkeysContext();
	let toolTipHidden = !enabledScopes.includes(paragraphId);

	return (
		<div>
			Paragraph {paragraph ? `"${paragraph.slice(0, 10)}..." ` : ''}Deleted{' '}
			<button
				onClick={handleClick}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.undoParagraphDeletion.label}
				data-tooltip-hidden={toolTipHidden}
			>
				UNDO
			</button>
		</div>
	);
};

export var ParagraphControlBtns = ({ paragraphId }: { paragraphId: string }) => {
	let dispatch = useAppDispatch();
	let toastId = useRef<Id>();
	const { articleId } = useParams();
	throwIfUndefined(articleId);

	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;

	let handleParagraphDeletion = () => {
		dispatch(addParagraphToDeletionQueue(paragraphId));

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
					paragraph={currentParagraph.paragraphAfterGrammarFix}
					paragraphId={paragraphId}
				/>
			),
			containerId: 'articleDeletion',
			options: { hideProgressBar: false },
		});

		toast.onChange((toastItem) => {
			if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
				// If the toastId check isn't included, changes to any toast would trigger the following.
				dispatch(finishParagraphDeletion({ paragraphId, articleId }));
				dispatch(updateArticleFirstParagraphEditDate(articleId));
			}
		});
	};

	let handleInsertParagraphAbove = () => dispatch(insertAboveParagraph({ paragraphId, articleId }));
	let handleInsertParagraphBelow = () => dispatch(insertBelowParagraph({ paragraphId, articleId }));

	useKeys({
		keyBinding: articlePageHotkeys.deleteParagraph.hotkey,
		callback: handleParagraphDeletion,
		scopes: paragraphId,
	});
	useKeys({
		keyBinding: articlePageHotkeys.insertParagraphAbove.hotkey,
		callback: handleInsertParagraphAbove,
		scopes: paragraphId,
	});
	useKeys({
		keyBinding: articlePageHotkeys.insertParagraphBelow.hotkey,
		callback: handleInsertParagraphBelow,
		scopes: paragraphId,
	});

	let { enabledScopes } = useHotkeysContext();
	let toolTipHidden = !enabledScopes.includes(paragraphId);

	return (
		<div>
			<button
				onClick={handleParagraphDeletion}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.deleteParagraph.label}
				data-tooltip-hidden={toolTipHidden}
			>
				Delete Paragraph
			</button>
			<div>
				<button>Insert New Paragraph</button>
				<button
					onClick={handleInsertParagraphAbove}
					data-tooltip-id='hotkey'
					data-tooltip-content={articlePageHotkeys.insertParagraphAbove.label}
					data-tooltip-hidden={toolTipHidden}
				>
					Insert Above
				</button>
				<button
					onClick={handleInsertParagraphBelow}
					data-tooltip-id='hotkey'
					data-tooltip-content={articlePageHotkeys.insertParagraphBelow.label}
					data-tooltip-hidden={toolTipHidden}
				>
					Insert Bellow
				</button>
			</div>
		</div>
	);
};
