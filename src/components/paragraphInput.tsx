import { useRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FallbackProps } from 'react-error-boundary';
import TextareaAutosize from 'react-textarea-autosize';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectArticle, saveParagraphInput, Paragraph, disableCancelQueryState, deleteParagraphRightAway } from '../features/articleSlice';

import { createToast, sanitizeUserInput } from '../utils/index';

interface ParagraphInputType {
	paragraph: string;
}

// log the last character inputted from previous render
var ParagraphInput = ({ paragraphId, resetErrorBoundary }: { paragraphId: string; resetErrorBoundary?: FallbackProps['resetErrorBoundary'] }) => {
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
		formState: { isDirty },
	} = useForm({
		defaultValues: {
			paragraph: localParagraph ?? paragraphValue,
		},
	});

	let { ref, ...rest } = register('paragraph', {
		onChange: (e) => {
			setLocalParagraph(e.target.value);
		},
	});

	// https://react-hook-form.com/faqs#Howtosharerefusage
	useImperativeHandle(ref, () => textareaRef.current);

	let onsubmit: SubmitHandler<ParagraphInputType> = (data) => {
		if (data.paragraph === '') {
			// empty paragraph get deleted right away
			dispatch(deleteParagraphRightAway(paragraphId));
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
				autoFocus
				{...rest}
				ref={textareaRef}
				spellCheck='true'
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

					let paste = e.clipboardData.getData('text');
					paste = paste.replace(/\n{2,}/g, '\n');
					let selectionStart: number | undefined = textareaRef.current?.selectionStart!;
					let selectionEnd: number | undefined = textareaRef.current?.selectionEnd!;
					let text: string | undefined = textareaRef.current?.value!;
					setValue('paragraph', text.substring(0, selectionStart) + paste + text.substring(selectionEnd));
				}}
			/>
			<button type='submit'>Done</button>
		</StyledForm>
	);
};
export default ParagraphInput;

var StyledForm = styled.form`
	height: 100%;
	textarea {
		padding: 2rem;
		width: 100%;
		height: 100%;
		white-space: pre-wrap;
		font-family: Arial, Helvetica, sans-serif;

		border-radius: 5px;
		border: 1px solid #ccc;
		resize: none;

		line-height: 1.5;
	}
`;
