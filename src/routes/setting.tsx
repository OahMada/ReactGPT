import { useForm, SubmitHandler } from 'react-hook-form';
import { useLocalStorage } from 'react-use';

interface APIKey {
	key: string;
}

var Setting = () => {
	let { register, handleSubmit } = useForm<APIKey>();
	let [apiKey, setApiKey] = useLocalStorage('apiKey');

	let onSubmit: SubmitHandler<APIKey> = (data) => {
		console.log(data);
	};

	return (
		<section>
			<form onSubmit={handleSubmit(onSubmit)}>
				<label htmlFor='api-key'>Input OpenAI API Key: </label>
				<input type='password' id='api-key' {...register('key')} />
			</form>
		</section>
	);
};
export default Setting;
