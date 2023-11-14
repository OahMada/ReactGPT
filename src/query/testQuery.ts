// react query
import { QueryFunctionContext } from '@tanstack/react-query';
import axios from 'axios';

export var testQueryKeys = (APIKey: string) => {
	return ['test', APIKey] as const;
};

export var testQuery = async ({ queryKey, signal }: QueryFunctionContext) => {
	let response = await axios.post(
		'/.netlify/functions/testAPI',
		{
			key: queryKey[1],
		},
		{ signal }
	);

	return response;
};
