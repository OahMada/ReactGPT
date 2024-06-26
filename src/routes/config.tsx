import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';

import { testQuery, testQueryKeys } from '../query/testQuery';
import { selectConfig, toggleAPIKeyInEdit } from '../features/configSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createToast, useKeys, HotkeyMapData } from '../utils';
import { Button } from '../styled/button';

interface APIKey {
	key: string;
}

export var Config = () => {
	let [key, setKey] = useState(''); // to access form submission data out of onSubmit handler
	let [inputFocus, setInputFocus] = useState(false);
	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string') as string | null;

	// react router
	let navigate = useNavigate();

	// redux
	let { APIKeyInEdit } = useAppSelector(selectConfig);
	let dispatch = useAppDispatch();

	/* react hook form */
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

	// create form error toast
	if (errors?.key?.message) {
		createToast({ type: 'error', content: errors.key.message, toastId: errors.key.message });
		reset(); // reset form state
	}

	let { ref, ...rest } = register('key', {
		required: 'Please enter your API key.',
		pattern: {
			value: new RegExp(`^sk-(proj-)?[a-zA-Z0-9]{32,}$|${import.meta.env.VITE_OPENAI_API_KEY_ALIAS}`),
			message: 'Invalid API Key Format',
		},
		onChange: () => {
			// clear errors after submitting https://stackoverflow.com/a/67659536/5800789 https://github.com/react-hook-form/react-hook-form/releases/tag/v7.16.0
			clearErrors('key'); //It is needed when displaying the error message text, or the message would keep showing up.
		},
	});

	let onSubmit: SubmitHandler<APIKey> = (data) => {
		setKey(data.key);
	};

	/* tanstack query */
	let { isError, isFetched, isFetching, error } = useQuery({
		queryKey: testQueryKeys(key),
		queryFn: testQuery,
		enabled: isSubmitSuccessful,
	});

	/* hotkey related */
	let clickEditButton = () => {
		dispatch(toggleAPIKeyInEdit());
	};

	let clickCancelButton = () => {
		navigate(-1);
		if (APIKeyInEdit) {
			dispatch(toggleAPIKeyInEdit());
		}
	};

	let { 'Config Page': configPageHotkeys } = HotkeyMapData();

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

	/* other */
	// handle query result
	useEffect(() => {
		// only run when done fetching. isFetched is for the beginning state, or the else logic is going to run
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
		<StyledSection>
			<div className='wrapper'>
				{secureLocalStorageAPIKey ? (
					<h1>
						Your API Key is:
						{` ${
							secureLocalStorageAPIKey === import.meta.env.VITE_OPENAI_API_KEY_ALIAS
								? 'DEFAULT'
								: /* v8 ignore next */
									secureLocalStorageAPIKey.split('').slice(0, 3).join('') + '***' + secureLocalStorageAPIKey.split('').slice(-4).join('')
						}`}
					</h1>
				) : (
					<h1>Please set up your API key:</h1>
				)}
				<p>The key will be securely stored locally and sent to OpenAI for authentication.</p>

				{(APIKeyInEdit || !secureLocalStorageAPIKey) && (
					<>
						<form onSubmit={handleSubmit(onSubmit)}>
							<label htmlFor='api-key'>OpenAI API Key: </label>
							<div>
								<input
									autoFocus
									type='password'
									id='api-key'
									{...rest}
									ref={APIInput}
									data-tooltip-id='hotkey'
									data-tooltip-content={configPageHotkeys.focusInput.label}
									data-tooltip-hidden={inputFocus}
									onFocus={() => setInputFocus(true)}
									onBlur={() => setInputFocus(false)}
								/>
								<Button type='submit' disabled={errors?.key?.message ? true : false || isFetching}>
									Done
								</Button>
							</div>
						</form>
					</>
				)}
				<div className='btns'>
					{!APIKeyInEdit && secureLocalStorageAPIKey && (
						<Button onClick={clickEditButton} data-tooltip-id='hotkey' data-tooltip-content={configPageHotkeys.edit.label}>
							Edit
						</Button>
					)}
					{secureLocalStorageAPIKey && (
						<Button type='button' onClick={clickCancelButton} data-tooltip-id='hotkey' data-tooltip-content={configPageHotkeys.cancel.label}>
							Cancel
						</Button>
					)}
				</div>
			</div>
		</StyledSection>
	);
};

var StyledSection = styled.section`
	display: grid;
	height: 100dvh;
	place-content: center;

	.wrapper {
		padding: 15px;
		border: 0.5px solid black;
		border-radius: var(--border-radius-big);

		@media (width <= 46.875rem) {
			border: none;
		}

		@media (width <= 28.125rem) {
			font-size: var(--font-small);
		}

		form {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--gap-primary);

			div {
				display: flex;
				flex-grow: 1;
			}

			input {
				display: inline-block;
				flex-grow: 1;
				margin-right: 3px;

				@media (width <= 28.125rem) {
					font-size: var(--font-primary);
				}
			}

			label {
				margin-right: 25px;
			}
		}

		h1 {
			font-size: var(--font-big);
			font-weight: 700;

			@media (width <= 28.125rem) {
				font-size: var(--font-primary);
			}
		}

		p {
			margin-bottom: 15px;
		}

		.btns {
			display: flex;
			margin-top: 10px;
			gap: var(--gap-big);
		}
	}
`;
