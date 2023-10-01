import { useForm, SubmitHandler } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveInput, selectArticle, saveParagraphInput, Paragraph } from '../features/article/articleSlice';

import styles from './userInput.module.css';

import { defaultUserInput } from '../utils/index';

interface UserInputType {
	text: string;
}

var UserInput = ({ paragraphId }: { paragraphId?: string }) => {
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
		<form onSubmit={handleSubmit(onsubmit)}>
			{errors.text && <p>{errors.text.message}</p>}
			<textarea
				className={styles.textarea}
				autoFocus
				{...register('text', {
					required: 'This filed is required',
					onChange: () => {
						// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
						clearErrors('text');
					},
				})}
				onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
					// TODO only control two adjacent enter key stroke
					// e.key === 'Enter' && e.preventDefault();
				}}
			/>
			<button type='submit'>Done</button>
		</form>
	);
};
export default UserInput;
