import { useEffect } from 'react';

// react query
import { QueryFunctionContext } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Paragraph, populateParagraphLocalState, selectArticle } from '../features/articleSlice';
import { findTheDiffsBetweenTwoStrings } from '../utils';

export var grammarQueryKeys = (paragraph: string, paragraphId: string) => {
	return ['grammar', paragraph, paragraphId] as const;
};

export var queryGrammarMistakes = async ({ queryKey, signal }: QueryFunctionContext<ReturnType<typeof grammarQueryKeys>>) => {
	let response = await axios.post(
		'/.netlify/functions/fetchGrammarMistakes',
		{
			text: queryKey[1],
		},
		{ signal }
	);

	return response.data['choices'][0]['message']['content'];
};

export function useGrammarQuery(paragraph: string, paragraphId: string) {
	let dispatch = useAppDispatch();
	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;

	let result = useQuery({
		queryKey: grammarQueryKeys(paragraph, paragraphId),
		queryFn: queryGrammarMistakes,
		select: (data) => {
			// There might be double line feeds in the returned value of GPT.
			data = data.replace(/\n{2,}/g, '\n');
			return findTheDiffsBetweenTwoStrings(paragraph, data);
		},
		// prevent fetch when in editing mode, only fetch after editing finished
		enabled: currentParagraph.paragraphStatus === 'modifying' && !currentParagraph.cancelQuery,
		throwOnError: true,
	});

	// to solve a bug:https://bobbyhadz.com/blog/react-cannot-update-component-while-rendering-different-component#cannot-update-a-component-while-rendering-a-different-component
	useEffect(() => {
		// populate local state
		// after clicking fix grammar mistakes button for refetch, if not check result.isFetched, old data would get populated
		if (
			result.isFetched &&
			result.data &&
			currentParagraph.adjustmentObjectArr.length === 0 &&
			currentParagraph.paragraphStatus === 'modifying' &&
			!currentParagraph.cancelQuery
		) {
			dispatch(populateParagraphLocalState({ paragraphId: currentParagraph.id, data: result.data }));
		}
	}, [
		currentParagraph.adjustmentObjectArr.length,
		currentParagraph.cancelQuery,
		currentParagraph.id,
		currentParagraph.paragraphStatus,
		dispatch,
		result.data,
		result.isFetched,
	]);

	return result;
}
