import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from 'axios';

// https://github.com/axios/axios/issues/3612
export var buildAxiosResponse = async (config: AxiosRequestConfig) => {
	try {
		let { data, status, statusText } = await axios(config);
		return new Response(JSON.stringify(data), { status, statusText });
	} catch (err) {
		let error = err as Error | AxiosError;
		// https://axios-http.com/docs/handling_errors
		if (isAxiosError(error)) {
			if (error.response) {
				return new Response(JSON.stringify(error.response.data), { status: error.response.status, statusText: error.response.statusText });
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				return new Response(JSON.stringify(error.request), { status: 500 });
			}
		} else {
			// Something happened in setting up the request that triggered an Error
			return new Response(JSON.stringify(error.message), { status: 500 });
		}
	}
};
