// react query
import { QueryFunctionContext, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

import { useAppSelector } from '../redux/hooks';
import { selectArticle } from '../features/articleSlice';
import { Paragraph, PartialParagraph } from '../types';

export var translationQueryKeys = (paragraphText: string, paragraphId: string) => {
	return ['translation', paragraphText, paragraphId] as const;
};

export var queryTranslation = async ({ queryKey, signal }: QueryFunctionContext<ReturnType<typeof translationQueryKeys>>) => {
	let response = await axios.post(
		'/.netlify/functions/fetchTranslation',
		{
			text: queryKey[1],
			key: secureLocalStorage.getItem('string'),
		},
		{ signal }
	);

	return response.data;
};

export function useTranslationQuery(paragraph: string, paragraphId: string) {
	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;

	let result = useQuery({
		queryKey: translationQueryKeys(paragraph, paragraphId),
		queryFn: queryTranslation,
		enabled: currentParagraph.paragraphStatus === 'doneModification' && currentParagraph.showTranslation,
		throwOnError: true,
	});

	return result;
}

export function useTranslationQueryVariant(paragraph: PartialParagraph) {
	let results = useSuspenseQuery({
		queryKey: translationQueryKeys(paragraph.paragraphText, paragraph.paragraphId),
		queryFn: queryTranslation,
	});

	return results;
}
