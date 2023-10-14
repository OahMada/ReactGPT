import { useRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FallbackProps } from 'react-error-boundary';
import TextareaAutosize from 'react-textarea-autosize';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveInput, selectArticle, saveParagraphInput, Paragraph, disableCancelQueryState, deleteParagraphRightAway } from '../features/articleSlice';

import { defaultUserInput, createToast, sanitizeUserInput } from '../utils/index';

interface UserInputType {
	text: string;
}

// log the last character inputted from previous render

var UserInput = ({ paragraphId, resetErrorBoundary }: { paragraphId?: string; resetErrorBoundary?: FallbackProps['resetErrorBoundary'] }) => {
	let textareaRef = useRef<HTMLTextAreaElement>(null);
	let dispatch = useAppDispatch();

	// calculate the paragraph text
	let { paragraphs } = useAppSelector(selectArticle);
	let paragraphValue: string | undefined;
	if (paragraphId !== undefined) {
		let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;
		paragraphValue = currentParagraph.paragraphBeforeGrammarFix;
	}

	let {
		register,
		handleSubmit,
		// clearErrors,
		formState: {
			// errors,
			isDirty,
		},
	} = useForm({
		defaultValues: {
			text: paragraphValue ?? defaultUserInput,
		},
		// reValidateMode: 'onSubmit',
	});

	let { ref, ...rest } = register('text', {
		// required: 'This filed is required',
		onChange: (e) => {
			// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
			// clearErrors('text');
		},
	});

	// https://react-hook-form.com/faqs#Howtosharerefusage
	useImperativeHandle(ref, () => textareaRef.current);

	let onsubmit: SubmitHandler<UserInputType> = (data) => {
		if (paragraphId !== undefined) {
			if (data.text === '') {
				// empty paragraph get deleted right away
				dispatch(deleteParagraphRightAway(paragraphId));
			}

			// trailing whitespace or line feeds do not count
			if (sanitizeUserInput(data.text) === paragraphValue) {
				isDirty = false;
			}

			// make the paragraph entitled for refetch: cancelQuery set to false
			if (!resetErrorBoundary && isDirty === true) {
				dispatch(disableCancelQueryState(paragraphId));
			}
			// click paragraph for editing
			dispatch(saveParagraphInput({ paragraphId, paragraphInput: data.text }));

			// for editing in error state
			if (resetErrorBoundary) {
				resetErrorBoundary();
			}
		} else {
			// initial article
			dispatch(saveInput(data.text));
		}
	};

	return (
		<StyledForm onSubmit={handleSubmit(onsubmit)}>
			{/* {errors.text && <p>{errors.text.message}</p>} */}
			<TextareaAutosize
				// TODO minRows could be dynamic? // container height divide by line height?
				minRows={paragraphId ? undefined : 30}
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
export default UserInput;

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
