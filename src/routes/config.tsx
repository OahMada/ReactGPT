import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useState } from 'react';

interface APIKey {
	key: string;
}

var Config = () => {
	let {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<APIKey>();
	let navigate = useNavigate();
	let [inEdit, setInEdit] = useState(false);

	let onSubmit: SubmitHandler<APIKey> = (data) => {
		secureLocalStorage.setItem('string', data.key);
		if (inEdit) {
			navigate(-1);
			setInEdit(false);
		} else {
			navigate('/');
		}
	};

	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string') as string | null;

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
								required: 'required',
							})}
						/>
					</form>
					<button type='submit' disabled={errors?.key?.message ? true : false}>
						Done
					</button>
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
