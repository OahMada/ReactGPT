import { useEffect } from 'react';

// react query
import { QueryFunctionContext } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Paragraph, populateParagraphLocalState, selectArticle } from '../features/article/articleSlice';
import { findTheDiffsBetweenTwoStrings } from '../utils';

var gptKeys = (paragraph: string) => {
	return ['gpt', paragraph] as const;
};

var queryGPT = async ({ queryKey, signal }: QueryFunctionContext<ReturnType<typeof gptKeys>>) => {
	let response = await axios.post(
		'https://api.openai.com/v1/chat/completions',
		{
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content:
						"You are an English learning assistant. You are going to fix only the grammar mistakes in the essay that the user passes to you. In the process, you have to make as few edits as possible. If there are no grammar mistakes, simply return the same unchanged essay back, please. If you received greeting messages, there's no need to greet back; just check for grammar mistakes as well.",
				},
				{ role: 'user', content: queryKey[1] },
			],
		},
		{ headers: { 'content-type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` }, signal }
	);

	return response.data['choices'][0]['message']['content'];
};

export function useGPT(paragraph: string) {
	let dispatch = useAppDispatch();
	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item) => item.paragraphBeforeGrammarFix === paragraph) as Paragraph;

	let result = useQuery({
		queryKey: gptKeys(paragraph),
		queryFn: queryGPT,
		select: (data) => findTheDiffsBetweenTwoStrings(paragraph, data),
		// prevent fetch when in editing mode, only fetch after editing finished
		enabled: currentParagraph.paragraphStatus === 'modifying',
	});

	// to solve a bug:https://bobbyhadz.com/blog/react-cannot-update-component-while-rendering-different-component#cannot-update-a-component-while-rendering-a-different-component
	useEffect(() => {
		// populate local state
		if (result.data && currentParagraph.adjustmentObjectArr.length === 0 && currentParagraph.paragraphStatus === 'modifying') {
			dispatch(populateParagraphLocalState({ paragraphId: currentParagraph.id, data: result.data }));
		}
	}, [currentParagraph.adjustmentObjectArr.length, currentParagraph.id, currentParagraph.paragraphStatus, dispatch, result.data]);

	return result;
}
