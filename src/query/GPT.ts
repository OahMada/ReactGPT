import { useEffect } from 'react';

// react query
import { QueryFunctionContext } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Paragraph, populateParagraphLocalState, selectArticle } from '../features/articleSlice';
import { findTheDiffsBetweenTwoStrings } from '../utils';

export var gptKeys = (paragraph: string) => {
	return ['gpt', paragraph] as const;
};

export var queryGPT = async ({ queryKey, signal }: QueryFunctionContext<ReturnType<typeof gptKeys>>) => {
	let response = await axios.post(
		'https://api.openai.com/v1/chat/completions',
		{
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are an English grammar fixer. You will correct only the grammar mistakes in the essay that the user provides. In the process, you should aim to make as few edits as possible.

					You will not engage in a conversation with the user. If you receive greeting messages like "Hello," your task is to check their grammar and return them as they are.
					
					If you receive gibberish messages, handle them as they are (while still fixing the grammar as you're a grammar fixer). There is no need to try to determine the user's intentions.`,
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