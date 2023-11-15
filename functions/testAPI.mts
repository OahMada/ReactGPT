import { Context, Config } from '@netlify/functions';
import { buildAxiosResponse } from '../src/utils';

export default async (req: Request) => {
	let reqBody = await req.json();
	if (reqBody.key === Netlify.env.get('VITE_OPENAI_API_KEY_ALIAS')) {
		reqBody.key = Netlify.env.get('VITE_OPENAI_API_KEY');
	}
	let url = 'https://api.openai.com/v1/chat/completions';
	let config = {
		method: 'post',
		url,
		data: { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'This is a test' }] },
		headers: { 'content-type': 'application/json', Authorization: `Bearer ${reqBody.key}` },
	};

	return await buildAxiosResponse(config);
};

export const config: Config = {
	method: 'POST',
};
