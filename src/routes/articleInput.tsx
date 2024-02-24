import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { saveArticleInput, selectArticle } from '../features/articleSlice';
import { createToast, defaultArticleInput, useKeys, HotkeyMapData, useNavigateWithSearchParams } from '../utils';

interface ArticleInputType {
	article: string;
}

// log the last character inputted from previous render
export var ArticleInput = () => {
	let dispatch = useAppDispatch();
	let { articleQueue } = useAppSelector(selectArticle);
	let articles = [...articleQueue.normal, ...articleQueue.favorites];
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
			{articles.length === 0 && (
				<div className='intro'>
					<h1>Input or paste your article into the textarea.</h1>
					<p>Paragraphs are separated by double line breaks.</p>
				</div>
			)}
			<TextareaAutosize
				autoFocus
				{...register('article', {
					required: 'This filed is required',
					minLength: { value: 10, message: 'Please input at least 10 characters.' },
					onChange: (e) => {
						// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
						clearErrors('article'); //It is needed when displaying the error message text, or the message would keep showing up.
						setLocalArticle(e.target.value);
					},
				})}
				spellCheck='true'
				placeholder='Article content.'
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
	display: grid;
	width: 70rem;
	height: 100%;
	align-items: end;

	.intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1rem;

		h1 {
			line-height: 1em + 0.5rem;
		}

		p {
			font-size: var(--font-larger);
		}
	}

	textarea {
		display: inline-block;
		width: 100%;
		min-height: 55dvh;
		padding: 20px;
		border: 1px solid var(--color-darker);
		border-radius: 5px;
		line-height: 1.5;
		resize: none;
		white-space: pre-wrap;
	}

	.btn-container {
		display: flex;
		margin-top: 10px;
		gap: 0.8rem;
	}
`;
