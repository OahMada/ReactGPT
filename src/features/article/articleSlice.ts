import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findTheDiffsBetweenTwoStrings, sanitizeUserInput, updateGrammarFixedArticle } from '../../utils';
import { refactoredChange, articleStatus } from '../../types';
import axios, { AxiosError } from 'axios';

export interface Article {
	initialArticle: string;
	grammarFixedArticle: string;
	status: articleStatus;
	adjustmentObjectArr: refactoredChange[];
	fixGrammarLoading: 'loading' | 'done';
	allAdjustmentsCount: number;
	appliedAdjustments: number;
}

let initialState: Article = {
	initialArticle: '',
	grammarFixedArticle: '',
	status: 'editing',
	adjustmentObjectArr: [],
	fixGrammarLoading: 'loading',
	allAdjustmentsCount: 0,
	appliedAdjustments: 0,
};

export var findGrammarMistakes = createAsyncThunk('article/findGrammarMistakes', async (rawArticle: string, thunkAPI) => {
	console.log(import.meta.env.VITE_OPENAI_API_KEY);
	try {
		let response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'You are an English learning assistant. You are going to fix the grammar mistakes in the essay the user passes to you. In the process, you have to make as few edits as possible.',
					},
					{ role: 'user', content: rawArticle },
				],
			},
			{ headers: { 'content-type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` } }
		);

		return response.data;
	} catch (error: unknown | AxiosError) {
		if (axios.isAxiosError(error)) {
			return thunkAPI.rejectWithValue(error.response?.data.msg);
		} else {
			console.log(error);
		}
	}
});

let articleSlice = createSlice({
	name: 'article',
	initialState,
	reducers: {
		saveInput: (state, action: PayloadAction<string>) => {
			state.status = 'modifying';
			state.initialArticle = sanitizeUserInput(action.payload);
		},
		// also be used when revert one adjustment
		acceptSingleAdjustment: (state, action: PayloadAction<number>) => {
			let targetObj = state.adjustmentObjectArr[action.payload];
			if (targetObj.added) {
				targetObj.value = targetObj.addedValue;
			} else {
				state.adjustmentObjectArr.splice(action.payload, 1);
			}
			state.appliedAdjustments += 1;
			if (state.allAdjustmentsCount === state.appliedAdjustments) {
				if (state.status === 'reviving') {
					state.status = 'intermediate';
				}
				if (state.status === 'modifying') {
					state.status = 'doneModification';
				}
			}
			state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr);
		},
		ignoreSingleAdjustment: (state, action: PayloadAction<number>) => {
			let targetObj = state.adjustmentObjectArr[action.payload];
			if (targetObj.removed) {
				targetObj.value = targetObj.removedValue;
			} else {
				state.adjustmentObjectArr.splice(action.payload, 1);
			}
			state.allAdjustmentsCount -= 1;
			if (state.allAdjustmentsCount === 0) {
				state.status = 'doneModification';
			}
			state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr);
		},
		acceptAllAdjustments: (state) => {
			state.adjustmentObjectArr = state.adjustmentObjectArr.reduce<refactoredChange[]>((acc, cur) => {
				if (cur.value) {
					acc.push(cur);
				}
				if (cur.added) {
					cur.value = cur.addedValue;
					acc.push(cur);
				}
				return acc;
			}, []);
			state.appliedAdjustments = state.allAdjustmentsCount;
			state.status = 'doneModification';
			state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr);
		},
		doneWithCurrentArticleState: (state) => {
			state.adjustmentObjectArr = state.adjustmentObjectArr.reduce<refactoredChange[]>((acc, cur) => {
				if (cur.value) {
					acc.push(cur);
				} else if (cur.removed) {
					cur.value = cur.removedValue;
					acc.push(cur);
				}
				return acc;
			}, []);
			state.status = 'doneModification';
			state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr);
		},
		checkEditHistory: (state) => {
			let result = findTheDiffsBetweenTwoStrings(state.grammarFixedArticle, state.initialArticle);
			console.log(result);
			state.adjustmentObjectArr = result;
			state.status = 'reviving';
			state.appliedAdjustments = 0;
			// for logic to work where when none available adjustments are left, change article.status
			state.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
				if (!cur.value) {
					acc += 1;
				}
				return acc;
			}, 0);
		},
		revertToBeginning: (state) => {
			state.grammarFixedArticle = state.initialArticle;
			state.status = 'intermediate';
		},
	},
	extraReducers(builder) {
		builder
			.addCase(findGrammarMistakes.pending, (state) => {
				state.fixGrammarLoading = 'loading';
			})
			.addCase(findGrammarMistakes.fulfilled, (state, action) => {
				console.log(state.initialArticle);
				console.log(action.payload['choices'][0]['message']['content']);

				let result = findTheDiffsBetweenTwoStrings(state.initialArticle, action.payload['choices'][0]['message']['content']);
				console.log(result);

				state.adjustmentObjectArr = result;
				state.fixGrammarLoading = 'done';
				state.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
					if (!cur.value) {
						acc += 1;
					}
					return acc;
				}, 0);
			})
			.addCase(findGrammarMistakes.rejected, (state) => {
				state.fixGrammarLoading = 'done';
			});
	},
});

export var {
	saveInput,
	ignoreSingleAdjustment,
	acceptSingleAdjustment,
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentArticleState,
	revertToBeginning,
} = articleSlice.actions;

export default articleSlice.reducer;
