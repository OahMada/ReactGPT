import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

interface APIKey {
	key: string;
}

var Config = () => {
	let { register, handleSubmit } = useForm<APIKey>();
	let navigate = useNavigate();

	let onSubmit: SubmitHandler<APIKey> = (data) => {
		secureLocalStorage.setItem('string', data.key);
		navigate('/');
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
export default Config;
