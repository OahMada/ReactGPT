import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';

import { useAppDispatch } from '../app/hooks';
import { saveInput } from '../features/articleSlice';

interface ArticleInputType {
	article: string;
}

// log the last character inputted from previous render
var ArticleInput = () => {
	let dispatch = useAppDispatch();

	let {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors },
	} = useForm({
		defaultValues: {
			article: '',
		},
		reValidateMode: 'onSubmit',
	});

	let onsubmit: SubmitHandler<ArticleInputType> = (data) => {
		dispatch(saveInput(data.article));
	};

	return (
		<StyledForm onSubmit={handleSubmit(onsubmit)}>
			{errors.article && <p>{errors.article.message}</p>}
			<TextareaAutosize
				// TODO minRows could be dynamic? // container height divide by line height?
				minRows={30}
				autoFocus
				{...register('article', {
					required: 'This filed is required',
					onChange: () => {
						// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
						clearErrors('article');
					},
				})}
				spellCheck='true'
			/>
			<button type='submit'>Done</button>
		</StyledForm>
	);
};
export default ArticleInput;

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
