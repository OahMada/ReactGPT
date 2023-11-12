// react query
import { QueryFunctionContext } from '@tanstack/react-query';
import axios from 'axios';

export var testQueryKeys = (APIKey: string) => {
	return ['test', APIKey] as const;
};

export var testQuery = async ({ queryKey, signal }: QueryFunctionContext) => {
	let response = await axios.post(
		'https://api.openai.com/v1/chat/completions',
		{
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: 'This is a test' }],
		},
		{ headers: { 'content-type': 'application/json', Authorization: `Bearer ${queryKey[1]}` }, signal }
	);

	return response;
};
