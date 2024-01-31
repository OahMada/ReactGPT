import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch } from '../redux/hooks';
import { saveArticleInput } from '../features/articleSlice';
import { createToast, defaultArticleInput, useKeys, HotkeyMapData, useNavigateWithSearchParams } from '../utils';

interface ArticleInputType {
	article: string;
}

// log the last character inputted from previous render
export var ArticleInput = () => {
	let dispatch = useAppDispatch();
	let navigateWithSearchParams = useNavigateWithSearchParams();

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
		setFocus,
		getValues,
	} = useForm({
		defaultValues: {
			article: localArticle ?? '',
		},
		reValidateMode: 'onSubmit', // Because I don't want the error message to show up every time I clear out the article text.
	});

	/* v8 ignore next 3 */
	if (errors.article) {
		createToast({ type: 'error', content: errors.article.message, toastId: errors.article.message });
	}

	let onsubmit: SubmitHandler<ArticleInputType> = (data) => {
		let articleId = uuidv4();
		dispatch(saveArticleInput({ articleText: data.article, articleId }));
		removeLocalArticle();
		// https://stackoverflow.com/questions/65800658/react-router-v6-navigate-to-a-url-with-searchparams
		navigateWithSearchParams(`article/${articleId}`);
	};

	let fillInText = () => {
		let articleText = getValues('article');
		// to preserve user input value
		let updatedArticle = articleText ? articleText + '\n\n' + defaultArticleInput : defaultArticleInput;
		setValue('article', updatedArticle);
		setLocalArticle(updatedArticle);
		setFocus('article');
	};

	let { 'Article Input Page': articleInputPageHotkeys } = HotkeyMapData();

	/* v8 ignore next 6 */
	useKeys({
		keyBinding: articleInputPageHotkeys.done.hotkey,
		callback: () => {
			handleSubmit(onsubmit)();
		},
	});

	return (
		<StyledForm onSubmit={handleSubmit(onsubmit)}>
			{/* {
				errors.article && <p>{errors.article.message}</p> // replace with toast
			} */}

			<TextareaAutosize
				// TODO minRows could be dynamic? // container height divide by line height?
				// minRows={25}
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
				placeholder='Please enter your article here.'
			/>
			<div className='btn-container'>
				<button type='button' onClick={fillInText} className='btn'>
					Fill in Demonstration Text
				</button>
				<button type='submit' data-tooltip-id='hotkey' data-tooltip-content={articleInputPageHotkeys.done.label} className='btn'>
					Done
				</button>
			</div>
		</StyledForm>
	);
};

var StyledForm = styled.form`
	height: 100%;

	textarea {
		display: inline-block;
		width: 100%;
		min-height: 90%;
		padding: 2rem;
		border: 1px solid var(--color-darker);
		border-radius: 5px;
		font-family: Arial, Helvetica, sans-serif;
		font-size: var(--font-primary);
		line-height: 1.5;
		resize: none;
		white-space: pre-wrap;
	}

	.btn-container {
		display: flex;
		gap: 0.8rem;
	}
`;
