import { useState } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveInput, selectArticle, saveParagraphInput, Paragraph } from '../features/article/articleSlice';

import styles from './userInput.module.css';

import { ToastContainer } from 'react-toastify';
import { defaultUserInput, createToast } from '../utils/index';

interface UserInputType {
	text: string;
}

// log the last character inputted from previous render

var UserInput = ({ paragraphId }: { paragraphId?: string }) => {
	let [userInputLastCharacter, setUserInputLastCharacter] = useState('');

	// calculate the paragraph text
	let { paragraphs } = useAppSelector(selectArticle);
	let paragraphValue;
	if (paragraphId !== undefined) {
		let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;
		paragraphValue = currentParagraph.paragraphBeforeGrammarFix;
	}

	let {
		register,
		handleSubmit,
		formState: { errors },
		clearErrors,
	} = useForm({
		values: {
			text: paragraphValue ?? defaultUserInput,
		},
		reValidateMode: 'onSubmit',
	});

	let dispatch = useAppDispatch();

	let onsubmit: SubmitHandler<UserInputType> = (data) => {
		if (paragraphId !== undefined) {
			// click paragraph for editing
			dispatch(saveParagraphInput({ paragraphId, paragraphInput: data.text }));
		} else {
			// initial article
			dispatch(saveInput(data.text));
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit(onsubmit)}>
				{errors.text && <p>{errors.text.message}</p>}
				<textarea
					className={styles.textarea}
					autoFocus
					{...register('text', {
						required: 'This filed is required',
						onChange: (e) => {
							// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
							clearErrors('text');
							setUserInputLastCharacter(e.target.value.slice(-1));
						},
					})}
					onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
						// https://github.com/orgs/react-hook-form/discussions/2549#discussioncomment-373578
						// prevent double line feeds, notify user to create a new paragraph
						if (paragraphId !== undefined) {
							if (e.key === 'Enter' && userInputLastCharacter === '\n') {
								e.preventDefault();
								createToast({ type: 'info', message: 'Consider adding a new paragraph instead of using double line breaks.' });
							}
						}
					}}
				/>
				<button type='submit'>Done</button>
			</form>
			<ToastContainer limit={3} />
		</>
	);
};
export default UserInput;
