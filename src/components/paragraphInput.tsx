import { useRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FallbackProps } from 'react-error-boundary';
import TextareaAutosize from 'react-textarea-autosize';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';
import { useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectArticle, saveParagraphInput, disableCancelQueryState, deleteParagraphRightAway, insertBelowParagraph } from '../features/articleSlice';

import { createToast, sanitizeUserInput, throwIfUndefined } from '../utils';
import { Paragraph } from '../types';
import { useFocusedParagraphIndexContext, useAutoFocusContext } from '.';

interface ParagraphInputType {
	paragraph: string;
}

// log the last character inputted from previous render
export var ParagraphInput = ({
	paragraphId,
	resetErrorBoundary,
}: {
	paragraphId: string;
	resetErrorBoundary?: FallbackProps['resetErrorBoundary'];
}) => {
	let { autoFocus, setAutoFocus } = useAutoFocusContext();
	let focusedParagraphIndexRef = useFocusedParagraphIndexContext();

	const { articleId } = useParams();
	throwIfUndefined(articleId);
	let textareaRef = useRef<HTMLTextAreaElement>(null);
	let dispatch = useAppDispatch();

	// calculate the paragraph text
	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;
	let paragraphValue =
		// if there were network error, use paragraphBeforeGrammarFix instead
		currentParagraph.paragraphAfterGrammarFix === '' ? currentParagraph.paragraphBeforeGrammarFix : currentParagraph.paragraphAfterGrammarFix;

	// Persist the paragraph while editing
	let [localParagraph, setLocalParagraph, removeLocalParagraph] = useLocalStorage(paragraphId, paragraphValue, {
		raw: false,
		serializer: (value) => compress(JSON.stringify(value)),
		deserializer: (value) => JSON.parse(decompress(value)),
	});

	let {
		register,
		handleSubmit,
		setValue,
		formState: { isDirty, errors },
	} = useForm({
		defaultValues: {
			paragraph: localParagraph ?? paragraphValue,
		},
	});

	/* v8 ignore next 3 */
	if (errors.paragraph) {
		createToast({ type: 'error', content: errors.paragraph.message, toastId: errors.paragraph.message });
	}

	let { ref, ...rest } = register('paragraph', {
		onChange: (e) => {
			setLocalParagraph(e.target.value);
		},
		minLength: { value: 10, message: 'Please input at least 10 characters.' },
	});

	// https://react-hook-form.com/faqs#Howtosharerefusage
	useImperativeHandle(ref, () => textareaRef.current);

	let onsubmit: SubmitHandler<ParagraphInputType> = (data) => {
		if (sanitizeUserInput(data.paragraph) === '') {
			// empty paragraph get deleted right away
			dispatch(deleteParagraphRightAway(paragraphId));
			focusedParagraphIndexRef.current = -1;
			return;
		}

		// trailing whitespace or line feeds do not count
		if (sanitizeUserInput(data.paragraph) === paragraphValue) {
			isDirty = false;
		} else {
			// When the webpage is refreshed, `isDirty` is reset to false. This ensures that the value is correct.
			isDirty = true;
		}

		// make the paragraph entitled for refetch: cancelQuery set to false
		if (!resetErrorBoundary && isDirty === true) {
			dispatch(disableCancelQueryState(paragraphId));
		}
		// click paragraph for editing
		dispatch(saveParagraphInput({ paragraphId, paragraphInput: data.paragraph }));

		// for editing in error state
		if (resetErrorBoundary) {
			resetErrorBoundary();
		}
		removeLocalParagraph();
	};

	return (
		<StyledForm onSubmit={handleSubmit(onsubmit)}>
			<TextareaAutosize
				autoFocus={autoFocus}
				{...rest}
				ref={textareaRef}
				spellCheck='true'
				placeholder='Please enter your paragraph content here.'
				onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
					// https://github.com/orgs/react-hook-form/discussions/2549#discussioncomment-373578
					// prevent double line feeds, notify user to create a new paragraph
					let cursorPosition: number | undefined = textareaRef.current?.selectionStart!;
					let text: string | undefined = textareaRef.current?.value!;
					let characterBeforeCursorPosition = text[cursorPosition - 1];
					let characterAfterCursorPosition = text[cursorPosition];

					if ((characterBeforeCursorPosition === '\n' || characterAfterCursorPosition === '\n') && e.key === 'Enter') {
						e.preventDefault();
						createToast({
							type: 'info',
							content: 'Consider adding a new paragraph instead of using double line breaks.',
							toastId: 'create new paragraph notice',
						});
					}
				}}
				// https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event // https://stackoverflow.com/questions/20509061/window-clipboarddata-getdatatext-doesnt-work-in-chrome
				// remove double line feeds from pasting text

				onPaste={(e: React.ClipboardEvent) => {
					e.preventDefault();

					let paste = sanitizeUserInput(e.clipboardData.getData('text'));
					let selectionStart: number | undefined = textareaRef.current?.selectionStart!;
					let selectionEnd: number | undefined = textareaRef.current?.selectionEnd!;
					let text: string | undefined = textareaRef.current?.value!;

					let combinedText = text.substring(0, selectionStart) + paste + text.substring(selectionEnd);
					let splitCombinedTextArr = combinedText.split(/\n{2,}/);

					setValue('paragraph', splitCombinedTextArr[0]);
					splitCombinedTextArr.shift();

					let payloadId = paragraphId;
					setAutoFocus(false); // do not autofocus newly created paragraph only in this situation.
					for (let index = 0; index < splitCombinedTextArr.length; index++) {
						let splitText = splitCombinedTextArr[index];
						dispatch(insertBelowParagraph({ paragraphId: payloadId, newParagraphText: splitText, indexOffset: index, articleId }));
					}
				}}
			/>
			<button type='submit' className='btn'>
				Done
			</button>
		</StyledForm>
	);
};

var StyledForm = styled.form`
	margin-top: calc(var(--util-icon-container-dimension) + 5px);

	textarea {
		width: 100%;
		height: 100%;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: var(--border-radius);
		font-family: Arial, Helvetica, sans-serif;
		resize: none;
		white-space: pre-wrap;
	}
`;
