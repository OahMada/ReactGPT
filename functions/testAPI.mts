import axios from 'axios';

export default async (req: Request) => {
	let reqBody = await req.json();
	let url = 'https://api.openai.com/v1/chat/completions';
	let config = {
		method: 'post',
		url,
		data: { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'This is a test' }] },
		headers: { 'content-type': 'application/json', Authorization: `Bearer ${reqBody.key}` },
	};

	let { data, status, statusText } = await axios(config);

	return new Response(JSON.stringify(data), { status, statusText });
};
