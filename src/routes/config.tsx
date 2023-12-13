import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { useQuery } from '@tanstack/react-query';

import { testQuery, testQueryKeys } from '../query/testQuery';
import { selectConfig, toggleAPIKeyInEdit } from '../features/configSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createToast, useKeys, hotkeyMap } from '../utils';

interface APIKey {
	key: string;
}

var { configPage: configPageHotkeys } = hotkeyMap;

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

	let { ref, ...rest } = register('key', {
		required: 'Please enter your API key.',
		pattern: {
			value: new RegExp(`^sk-[a-zA-Z0-9]{32,}$|${import.meta.env.VITE_OPENAI_API_KEY_ALIAS}`),
			message: 'Invalid API Key Format',
		},
		onChange: () => {
			// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
			clearErrors('key'); //It is needed when displaying the error message text, or the message would keep showing up.
		},
	});

	let { isError, isFetched, isFetching, error } = useQuery({
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

	let clickEditButton = () => {
		dispatch(toggleAPIKeyInEdit());
	};

	let clickCancelButton = () => {
		navigate(-1);
		if (APIKeyInEdit) {
			dispatch(toggleAPIKeyInEdit());
		}
	};

	useKeys({ keyBinding: configPageHotkeys.edit.hotkey, callback: clickEditButton });
	useKeys({ keyBinding: configPageHotkeys.cancel.hotkey, callback: clickCancelButton });

	let APIInput = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => APIInput.current);
	useKeys({
		keyBinding: configPageHotkeys.focusInput.hotkey,
		callback: () => {
			APIInput.current!.focus();
		},
	});

	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string') as string | null;

	useEffect(() => {
		// only run when done fetching. ifFetched is for the beginning state, or the else logic is going to run
		if (!isFetching && isFetched) {
			if (isError) {
				createToast({ type: 'error', content: error?.message, toastId: error?.message });
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
	}, [isError, isFetching, isFetched, key, APIKeyInEdit, navigate, reset, dispatch, error]);

	return (
		<section>
			{secureLocalStorageAPIKey ? (
				<h1>
					Your API Key is:
					{` ${
						secureLocalStorageAPIKey === import.meta.env.VITE_OPENAI_API_KEY_ALIAS
							? 'DEFAULT'
							: secureLocalStorageAPIKey.split('').slice(0, 3).join('') + '***' + secureLocalStorageAPIKey.split('').slice(-4).join('')
					}`}
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
							{...rest}
							ref={APIInput}
							data-tooltip-id='hotkey'
							data-tooltip-content={configPageHotkeys.focusInput.label}
						/>
						<button type='submit' disabled={errors?.key?.message ? true : false || isFetching}>
							Done
						</button>
					</form>
				</>
			) : (
				<button onClick={clickEditButton} data-tooltip-id='hotkey' data-tooltip-content={configPageHotkeys.edit.label}>
					Edit
				</button>
			)}
			{secureLocalStorageAPIKey && (
				<button type='button' onClick={clickCancelButton} data-tooltip-id='hotkey' data-tooltip-content={configPageHotkeys.cancel.label}>
					Cancel
				</button>
			)}
		</section>
	);
};
