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
import { createToast, throwIfUndefined, useKeys, HotkeyMapData } from '../utils';
import { Paragraph } from '../types';
import { useAutoFocusContext } from './autoFocus';

// https://github.com/fkhadra/react-toastify/issues/568#issuecomment-779847274
interface UndoProps extends Partial<ToastContentProps> {
	onUndo: () => void;
	closeToast: () => void;
	paragraph: string;
	paragraphId: string;
}

var Undo = ({ closeToast, onUndo, paragraph, paragraphId }: UndoProps) => {
	const handleClick = () => {
		onUndo();
		closeToast();
	};

	let { 'Article Page': articlePageHotkeys } = HotkeyMapData();
	let { enabledScopes } = useHotkeysContext();
	let toolTipHidden = !enabledScopes.includes(paragraphId);

	useKeys({
		keyBinding: articlePageHotkeys.undoParagraphDeletion.hotkey,
		callback: handleClick,
		scopes: paragraphId,
		enabled: enabledScopes.includes(paragraphId),
	});

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
	let { setAutoFocus } = useAutoFocusContext();
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
					/* v8 ignore next 3 */
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

		/* v8 ignore next 7 */
		toast.onChange((toastItem) => {
			if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
				// If the toastId check isn't included, changes to any toast would trigger the following.
				dispatch(finishParagraphDeletion({ paragraphId, articleId }));
				dispatch(updateArticleFirstParagraphEditDate(articleId));
			}
		});
	};

	let handleInsertParagraphAbove = () => {
		setAutoFocus(true);
		dispatch(insertAboveParagraph({ paragraphId, articleId }));
	};
	let handleInsertParagraphBelow = () => {
		setAutoFocus(true);
		dispatch(insertBelowParagraph({ paragraphId, articleId }));
	};

	let { enabledScopes } = useHotkeysContext();
	let toolTipHidden = !enabledScopes.includes(paragraphId);
	let { 'Article Page': articlePageHotkeys } = HotkeyMapData();

	useKeys({
		keyBinding: articlePageHotkeys.deleteParagraph.hotkey,
		callback: handleParagraphDeletion,
		scopes: paragraphId,
		enabled: enabledScopes.includes(paragraphId) && currentParagraph.paragraphStatus !== 'editing',
	});
	useKeys({
		keyBinding: articlePageHotkeys.insertParagraphAbove.hotkey,
		callback: handleInsertParagraphAbove,
		scopes: paragraphId,
		enabled: enabledScopes.includes(paragraphId) && currentParagraph.paragraphStatus !== 'editing',
	});
	useKeys({
		keyBinding: articlePageHotkeys.insertParagraphBelow.hotkey,
		callback: handleInsertParagraphBelow,
		scopes: paragraphId,
		enabled: enabledScopes.includes(paragraphId) && currentParagraph.paragraphStatus !== 'editing',
	});

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
					Insert Below
				</button>
			</div>
		</div>
	);
};
