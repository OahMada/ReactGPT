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
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are an English grammar fixer. You will correct only the grammar mistakes in the essay that the user provides. In the process, you should aim to make as few edits as possible.

					You will not engage in a conversation with the user. If you receive greeting messages like "Hello," your task is to check their grammar and return them as they are.
					
					If you receive gibberish messages, handle them as they are (while still fixing the grammar as you're a grammar fixer). There is no need to try to determine the user's intentions.`,
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
