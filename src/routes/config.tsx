import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { testQuery, testQueryKeys } from '../query/testQuery';

import { createToast } from '../utils';
import { selectConfig, toggleAPIKeyInEdit } from '../features/configSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

interface APIKey {
	key: string;
}

export var Config = () => {
	let navigate = useNavigate();

	let { APIKeyInEdit } = useAppSelector(selectConfig);
	let dispatch = useAppDispatch();
	let [key, setKey] = useState(''); // to access form submission data out of onSubmit handler
	let {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors, isSubmitSuccessful },
		reset,
	} = useForm<APIKey>({
		reValidateMode: 'onSubmit',
		defaultValues: {
			key: '',
		},
	});

	let { isError, isFetched, isFetching } = useQuery({
		queryKey: testQueryKeys(key),
		queryFn: testQuery,
		enabled: isSubmitSuccessful,
	});

	let onSubmit: SubmitHandler<APIKey> = (data) => {
		// if (data.key === import.meta.env.VITE_OPENAI_API_KEY_ALIAS) {
		// 	setKey(import.meta.env.VITE_OPENAI_API_KEY);
		// } else {
		setKey(data.key);
		// }
	};

	// create form error toast
	if (errors?.key?.message) {
		createToast({ type: 'error', content: errors.key.message, toastId: errors.key.message });
		reset(); // reset form state
	}

	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string') as string | null;

	useEffect(() => {
		// only run when done fetching. ifFetched is for the beginning state, or the else logic is going to run
		if (!isFetching && isFetched) {
			if (isError) {
				createToast({ type: 'error', content: 'Invalid API Key.', toastId: 'Invalid API Key' });
			} else {
				secureLocalStorage.setItem('string', key);
				if (APIKeyInEdit) {
					dispatch(toggleAPIKeyInEdit());
					navigate(-1);
				} else {
					navigate('/');
				}
			}
			reset(); // reset form after process done
		}
	}, [isError, isFetching, isFetched, key, APIKeyInEdit, navigate, reset, dispatch]);

	return (
		<section>
			{secureLocalStorageAPIKey ? (
				<h1>
					Your API Key is: {`${secureLocalStorageAPIKey.split('').slice(0, 3).join('')}***${secureLocalStorageAPIKey.split('').slice(-4).join('')}`}
				</h1>
			) : (
				<h1>Please set your API key first</h1>
			)}
			<p>The key will be securely stored locally.</p>

			{APIKeyInEdit || !secureLocalStorageAPIKey ? (
				<>
					<form onSubmit={handleSubmit(onSubmit)}>
						<label htmlFor='api-key'>Input Your OpenAI API Key: </label>
						<input
							type='password'
							id='api-key'
							{...register('key', {
								required: 'Please enter your API key.',
								pattern: {
									value: new RegExp(`^sk-[a-zA-Z0-9]{32,}$|${import.meta.env.VITE_OPENAI_API_KEY_ALIAS}`),
									message: 'Invalid API Key Format',
								},
								onChange: () => {
									// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
									clearErrors('key'); //It is needed when displaying the error message text, or the message would keep showing up.
								},
							})}
						/>
						<button type='submit' disabled={errors?.key?.message ? true : false || isFetching}>
							Done
						</button>
					</form>
				</>
			) : (
				<button
					onClick={() => {
						dispatch(toggleAPIKeyInEdit());
					}}
				>
					Edit
				</button>
			)}
			{secureLocalStorageAPIKey && (
				<button
					type='button'
					onClick={() => {
						navigate(-1);
						dispatch(toggleAPIKeyInEdit());
					}}
				>
					Cancel
				</button>
			)}
		</section>
	);
};
