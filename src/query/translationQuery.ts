// react query
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import axios from 'axios';

import { useAppSelector } from '../app/hooks';
import { Paragraph, selectArticle } from '../features/articleSlice';

export var translationQueryKeys = (paragraphText: string, paragraphId: string) => {
	return ['translation', paragraphText, paragraphId] as const;
};

export var queryTranslation = async ({ queryKey, signal }: QueryFunctionContext<ReturnType<typeof translationQueryKeys>>) => {
	let response = await axios.post(
		'https://api.openai.com/v1/chat/completions',
		{
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a language translator. You will translate any text provided by the user into Chinese.`,
				},
				{ role: 'user', content: queryKey[1] },
			],
		},
		{ headers: { 'content-type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` }, signal }
	);

	return response.data['choices'][0]['message']['content'];
};

export function useTranslationQuery(paragraph: string, paragraphId: string) {
	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;

	let result = useQuery({
		queryKey: translationQueryKeys(paragraph, paragraphId),
		queryFn: queryTranslation,
		enabled: currentParagraph.paragraphStatus === 'doneModification' && currentParagraph.showTranslation,
		useErrorBoundary: true,
	});

	return result;
}
