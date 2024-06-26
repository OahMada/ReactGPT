import { Config } from '@netlify/functions';
import { buildAxiosResponse } from './buildAxiosResponse';

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
			model: 'gpt-4o',
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

export var config: Config = {
	method: 'POST',
};
