import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { testQuery, testQueryKeys } from '../query/testQuery';
import { createToast } from '../utils';

interface APIKey {
	key: string;
}

var Config = () => {
	let navigate = useNavigate();
	let [inEdit, setInEdit] = useState(false);
	let {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors, isSubmitSuccessful }, // TODO toast message for errors
	} = useForm<APIKey>({
		reValidateMode: 'onSubmit',
		defaultValues: {
			key: '',
		},
	});

	console.log(isSubmitSuccessful);

	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string') as string | null;

	let { data } = useQuery({
		queryKey: testQueryKeys(secureLocalStorageAPIKey as string),
		queryFn: testQuery,
		enabled: isSubmitSuccessful && Boolean(secureLocalStorageAPIKey),
	});

	console.log(data);

	let onSubmit: SubmitHandler<APIKey> = (data) => {
		secureLocalStorage.setItem('string', data.key);
		if (inEdit) {
			// navigate(-1);
			setInEdit(false);
		} else {
			// navigate('/');
		}
	};

	if (errors?.key?.message) {
		createToast({ type: 'error', content: errors.key.message, toastId: errors.key.message });
	}

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
								onChange: (e) => {
									// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
									clearErrors('key'); //It is needed when displaying the error message text, or the message would keep showing up.
								},
							})}
						/>
						<button type='submit' disabled={errors?.key?.message ? true : false}>
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
			<button type='button' onClick={() => navigate(-1)}>
				Cancel
			</button>
		</section>
	);
};
export default Config;

// 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
