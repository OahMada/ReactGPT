import { http, HttpResponse } from 'msw';

interface requestBodyType {
	type: 'test' | 'grammar' | 'translation';
	key: string;
	text?: string;
}

export var handlers = [
	http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
		let requestBody = (await request.json()) as requestBodyType;

		if (requestBody.type === 'test') {
		} else if (requestBody.type === 'grammar') {
			return HttpResponse.json({
				choices: [
					{
						index: 0,
						message: {
							content:
								'A voiceless sound, sometimes called an unvoiced sound, occurs when there is no vibration in your throat and the sound originates from the mouth area. Try pronouncing the letter P. You will notice that it emanates from your mouth, specifically near your lips at the front of your mouth. The P sound does not originate from your throat.',
						},
					},
				],
			});
		} else if (requestBody.type === 'translation') {
		}
	}),
];
