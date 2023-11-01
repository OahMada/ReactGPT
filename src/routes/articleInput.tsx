import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch } from '../app/hooks';
import { saveArticleInput } from '../features/articleSlice';
import { createToast, defaultArticleInput } from '../utils';

interface ArticleInputType {
	article: string;
}

// log the last character inputted from previous render
var ArticleInput = () => {
	let dispatch = useAppDispatch();
	let navigate = useNavigate();

	let [localArticle, setLocalArticle, removeLocalArticle] = useLocalStorage('article', '', {
		raw: false,
		serializer: (value) => compress(JSON.stringify(value)),
		deserializer: (value) => JSON.parse(decompress(value)),
	});

	let {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors },
		setValue,
	} = useForm({
		defaultValues: {
			article: localArticle ?? '',
		},
		reValidateMode: 'onSubmit', // Because I don't want the error message to show up every time I clear out the article text.
	});

	if (errors.article) {
		createToast({ type: 'error', content: errors.article.message, toastId: errors.article.message });
	}

	let onsubmit: SubmitHandler<ArticleInputType> = (data) => {
		let articleId = uuidv4();
		dispatch(saveArticleInput({ articleText: data.article, articleId }));
		removeLocalArticle();
		navigate(`article/${articleId}`);
	};

	return (
		<StyledForm onSubmit={handleSubmit(onsubmit)}>
			{/* {
				errors.article && <p>{errors.article.message}</p> // replace with toast
			} */}
			<button
				type='button'
				onClick={() => {
					setValue('article', defaultArticleInput);
				}}
			>
				Fill in Demonstration Text
			</button>

			<TextareaAutosize
				// TODO minRows could be dynamic? // container height divide by line height?
				minRows={30}
				autoFocus
				{...register('article', {
					required: 'This filed is required',
					onChange: (e) => {
						// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
						clearErrors('article'); //It is needed when displaying the error message text, or the message would keep showing up.
						setLocalArticle(e.target.value);
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
