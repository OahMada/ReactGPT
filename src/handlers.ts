import { http, HttpResponse, delay } from 'msw';
import { defaultArticleInput } from './utils';

export var handlers = [
	http.post('/.netlify/functions/fetchGrammarMistakes', async ({ request }) => {
		let { text } = (await request.json()) as { text: string; key: string };
		// return new HttpResponse(null, { status: 500 });
		await delay(500);
		if (text === 'Hello there.') {
			return HttpResponse.text(text);
		}
		if (text === defaultArticleInput.split('\n\n')[1]) {
			return HttpResponse.text(
				'A voiceless sound (sometimes called an unvoiced sound) occurs when there is no vibration in your throat, and the sound originates from the mouth area. Pronounce the letter P. You will notice that it originates from your mouth, specifically near your lips at the front of your mouth. The P sound does not originate from your throat.'
			);
		}
		return HttpResponse.text(
			'A voiced consonant (or sound) means that it uses the vocal cords, and they produce a vibration or humming sound in the throat when they are pronounced. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck/throat. That is because it is a voiced sound.'
		);
	}),
	http.post('/.netlify/functions/fetchTranslation', async () => {
		await delay(500);
		return HttpResponse.text(
			'一个浊辅音（或声音）意味着它使用了声带，并且在发音时它们在喉咙中产生振动或嗡鸣声。把手指放在喉咙上，然后发出字母L的音。你会注意到你的脖子/喉咙有微弱的振动。这是因为它是一个浊音。'
		);
	}),
	http.post('/.netlify/functions/testAPI', async () => {
		await delay(500);
		return new HttpResponse(null, {
			status: 200,
		});
	}),
];
