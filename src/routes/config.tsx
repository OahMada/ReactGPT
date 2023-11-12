import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { testQuery, testQueryKeys } from '../query/testQuery';
import { createToast } from '../utils';

interface APIKey {
	key: string;
}

var Config = () => {
	let navigate = useNavigate();

	let [inEdit, setInEdit] = useState(false); // to track the editing status
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
		setKey(data.key);
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
				if (inEdit) {
					setInEdit(false);
					navigate(-1);
				} else {
					navigate('/');
				}
			}
			reset(); // reset form after process done
		}
	}, [isError, isFetching, isFetched, key, inEdit, navigate, reset]);

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

			{inEdit || !secureLocalStorageAPIKey ? (
				<>
					<form onSubmit={handleSubmit(onSubmit)}>
						<label htmlFor='api-key'>Input Your OpenAI API Key: </label>
						<input
							type='password'
							id='api-key'
							{...register('key', {
								required: 'Please enter your API key.',
								pattern: {
									value: /^sk-[a-zA-Z0-9]{32,}$/,
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
						setInEdit(true);
					}}
				>
					Edit
				</button>
			)}
			{secureLocalStorageAPIKey && (
				<button type='button' onClick={() => navigate(-1)}>
					Cancel
				</button>
			)}
		</section>
	);
};
export default Config;
