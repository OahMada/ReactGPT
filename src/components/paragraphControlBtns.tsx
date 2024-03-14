import { useRef, forwardRef } from 'react';
import { toast, Id } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { RxHamburgerMenu } from 'react-icons/rx';
import styled from 'styled-components';

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
import { ControlOptionsMenu, UndoDeletionWrapper, ControlOptionsMenuContainerStyles } from '../styled';
import { Button } from '../styled/button';

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
		<UndoDeletionWrapper>
			<h4>
				{paragraph.length > 10
					? `Deleting Paragraph "${paragraph.slice(0, 10)}..."`
					: paragraph.length > 0
						? `Deleting Paragraph "${paragraph}"`
						: 'Deleting Paragraph'}
			</h4>
			<Button
				onClick={handleClick}
				data-tooltip-id='hotkey'
				data-tooltip-content={articlePageHotkeys.undoParagraphDeletion.label}
				data-tooltip-hidden={toolTipHidden}
			>
				UNDO
			</Button>
		</UndoDeletionWrapper>
	);
};

export var ParagraphControlBtns = ({ paragraphId, index, paragraphFocused }: { paragraphId: string; index: number; paragraphFocused: boolean }) => {
	let paragraphHoverStatusRef = useRef(false);
	let { setAutoFocus } = useAutoFocusContext();
	let focusedParagraphIndexRef = useFocusedParagraphIndexContext();
	let { disableScope, enabledScopes } = useHotkeysContext();

	let dispatch = useAppDispatch();
	let toastId = useRef<Id>();
	const { articleId } = useParams();
	throwIfUndefined(articleId);

	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;

	let handleParagraphDeletion = () => {
		dispatch(addParagraphToDeletionQueue(paragraphId));
		if (paragraphFocused) {
			focusedParagraphIndexRef.current = -1;
			enabledScopes.forEach((scope) => {
				disableScope(scope);
			});
		}
		// to adapt to the number of paragraph changes
		if (!paragraphFocused && focusedParagraphIndexRef.current > index) focusedParagraphIndexRef.current -= 1;

		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						dispatch(undoParagraphDeletion(paragraphId));
						// to adapt to the number of paragraph changes
						if (focusedParagraphIndexRef.current !== -1 && focusedParagraphIndexRef.current >= index) {
							focusedParagraphIndexRef.current += 1;
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
			toastId: paragraphId,
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
		<StyledDiv>
			<div
				className='paragraph-menu'
				onMouseOver={(e) => {
					e.currentTarget.classList.add('hover');
					paragraphHoverStatusRef.current = true;
				}}
				onMouseLeave={(e) => {
					// https://stackoverflow.com/a/67790489/5800789
					let eventTarget = e.currentTarget;
					paragraphHoverStatusRef.current = false;
					setTimeout(() => {
						if (paragraphHoverStatusRef.current === false) eventTarget.classList.remove('hover');
					}, 300);
				}}
			>
				<RxHamburgerMenu />
			</div>
			<ControlOptionsMenu
				onMouseLeave={(e) => {
					// https://stackoverflow.com/a/67790489/5800789
					let eventTarget = e.currentTarget;
					setTimeout(() => {
						eventTarget.classList.remove('hover');
					}, 300);
				}}
				onMouseEnter={(e) => {
					e.currentTarget.classList.add('hover');
				}}
			>
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
		</StyledDiv>
	);
};

var StyledDiv = styled.div`
	top: 10px;
	right: 10px;
	${ControlOptionsMenuContainerStyles}

	.paragraph-menu {
		display: grid;

		/* https://www.joshwcomeau.com/css/css-variables-for-react-devs/#:~:text=industry%20guidelines%20are%20that%20interactive%20elements%20should%20be%20between%2044px%20and%2048px%20tall. */
		width: var(--util-icon-container-dimension);
		height: var(--util-icon-container-dimension);
		place-content: center;
	}

	.paragraph-menu.hover + div {
		display: flex;
	}
`;

type Ref = HTMLButtonElement;

var NoFocusPropagationButton = forwardRef<Ref, React.ComponentPropsWithRef<'button'>>(({ children, ...props }, ref) => {
	return (
		<Button {...props} onFocus={(e) => e.stopPropagation()} ref={ref}>
			{children}
		</Button>
	);
});
