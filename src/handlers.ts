import { http, HttpResponse } from 'msw';

export var handlers = [
	http.post('/.netlify/functions/fetchGrammarMistakes', async () => {
		return HttpResponse.text(
			'A voiced consonant (or sound) means that it uses the vocal cords, and they produce a vibration or humming sound in the throat when they are pronounced. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck/throat. That is because it is a voiced sound.'
		);
	}),
	http.post('/.netlify/functions/fetchTranslation', async () => {
		return HttpResponse.text(
			'一个浊辅音（或声音）意味着它使用了声带，并且在发音时它们在喉咙中产生振动或嗡鸣声。把手指放在喉咙上，然后发出字母L的音。你会注意到你的脖子/喉咙有微弱的振动。这是因为它是一个浊音。'
		);
	}),
	http.post('/.netlify/functions/testAPI', async () => {
		return new HttpResponse(null, {
			status: 200,
		});
	}),
];
