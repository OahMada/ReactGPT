import { useRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FallbackProps } from 'react-error-boundary';
import TextareaAutosize from 'react-textarea-autosize';

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
	let paragraphValue = currentParagraph.paragraphBeforeGrammarFix;

	let {
		register,
		handleSubmit,
		formState: { isDirty },
	} = useForm({
		defaultValues: {
			paragraph: paragraphValue,
		},
	});

	let { ref, ...rest } = register('paragraph');

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
					if (paragraphId !== undefined) {
						let cursorPosition: number | undefined = textareaRef.current?.selectionStart;
						let text: string | undefined = textareaRef.current?.value;
						let characterBeforeCursorPosition: string | undefined;
						let characterAfterCursorPosition: string | undefined;
						if (cursorPosition !== undefined && text) {
							characterBeforeCursorPosition = text[cursorPosition - 1];
							characterAfterCursorPosition = text[cursorPosition];
						}

						if ((characterBeforeCursorPosition === '\n' || characterAfterCursorPosition === '\n') && e.key === 'Enter') {
							e.preventDefault();
							createToast({
								type: 'info',
								content: 'Consider adding a new paragraph instead of using double line breaks.',
								toastId: 'create new paragraph notice',
							});
						}
					}
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
