import { useRef, forwardRef } from 'react';
import { toast, Id } from 'react-toastify';
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
import { useAutoFocusContext, useFocusedParagraphIndexContext } from './';
import { ControlOptionsMenu } from '../styles';

// https://github.com/fkhadra/react-toastify/issues/568#issuecomment-779847274
interface UndoProps {
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
			Deleting Paragraph {`"${paragraph.slice(0, 10)}..." `}
			<button
				onClick={handleClick}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.undoParagraphDeletion.label}
				data-tooltip-hidden={toolTipHidden}
				className='btn'
			>
				UNDO
			</button>
		</div>
	);
};

export var ParagraphControlBtns = ({ paragraphId, index, paragraphFocused }: { paragraphId: string; index: number; paragraphFocused: boolean }) => {
	let { setAutoFocus } = useAutoFocusContext();
	let focusedParagraphIndexRef = useFocusedParagraphIndexContext();

	let dispatch = useAppDispatch();
	let toastId = useRef<Id>();
	const { articleId } = useParams();
	throwIfUndefined(articleId);

	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;

	let handleParagraphDeletion = () => {
		dispatch(addParagraphToDeletionQueue(paragraphId));
		focusedParagraphIndexRef.current = -1;

		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						dispatch(undoParagraphDeletion(paragraphId));
						if (paragraphFocused) {
							focusedParagraphIndexRef.current = index;
						}
					}}
					/* v8 ignore next 3 */
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
					paragraph={
						currentParagraph.paragraphAfterGrammarFix ? currentParagraph.paragraphAfterGrammarFix : currentParagraph.paragraphBeforeGrammarFix
					}
					paragraphId={paragraphId}
				/>
			),
			options: { hideProgressBar: false, closeOnClick: false, closeButton: false },
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
	let toolTipHidden = !enabledScopes.includes(paragraphId) || currentParagraph.paragraphStatus === 'editing'; // the hotkeys are not gonna enabled when in editing mode
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
		<ControlOptionsMenu>
			<NoFocusPropagationButton
				onClick={handleParagraphDeletion}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.deleteParagraph.label}
				data-tooltip-hidden={toolTipHidden}
			>
				Delete Paragraph
			</NoFocusPropagationButton>
			<NoFocusPropagationButton
				onClick={handleInsertParagraphAbove}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.insertParagraphAbove.label}
				data-tooltip-hidden={toolTipHidden}
			>
				Insert Above
			</NoFocusPropagationButton>
			<NoFocusPropagationButton
				onClick={handleInsertParagraphBelow}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.insertParagraphBelow.label}
				data-tooltip-hidden={toolTipHidden}
			>
				Insert Below
			</NoFocusPropagationButton>
		</ControlOptionsMenu>
	);
};

type Ref = HTMLButtonElement;

var NoFocusPropagationButton = forwardRef<Ref, React.ComponentPropsWithRef<'button'>>(({ children, ...props }, ref) => {
	return (
		<button {...props} onFocus={(e) => e.stopPropagation()} ref={ref} className='btn'>
			{children}
		</button>
	);
});
