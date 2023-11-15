import { Context, Config } from '@netlify/functions';
import { buildAxiosResponse } from '../src/utils';

export default async (req: Request) => {
	let reqBody = await req.json();

	var key = reqBody.key;
	if (key === Netlify.env.get('VITE_OPENAI_API_KEY_ALIAS')) {
		key = Netlify.env.get('VITE_OPENAI_API_KEY');
	}

	let url = 'https://api.openai.com/v1/chat/completions';
	let config = {
		method: 'post',
		url,
		data: {
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a language translator. You will translate any text provided by the user into Chinese.`,
				},
				{ role: 'user', content: reqBody.text },
			],
		},
		headers: { 'content-type': 'application/json', Authorization: `Bearer ${key}` },
	};

	return await buildAxiosResponse(config);
};

export const config: Config = {
	method: 'POST',
};
