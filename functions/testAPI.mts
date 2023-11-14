import axios from 'axios';
import { Context } from '@netlify/functions';

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

	try {
		let { data, status, statusText } = await axios(config);
		return new Response(JSON.stringify(data), { status, statusText });
	} catch (error) {
		// https://axios-http.com/docs/handling_errors
		if (error.response) {
			return new Response(JSON.stringify(error.response.data), { status: error.response.status, statusText: error.response.statusText });
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			return new Response(JSON.stringify(error.request), { status: 500 });
		} else {
			// Something happened in setting up the request that triggered an Error
			return new Response(JSON.stringify(error.message), { status: 500 });
		}
	}
};
