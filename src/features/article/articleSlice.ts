import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findTheDiffsBetweenTwoStrings, sanitizeUserInput, updateGrammarFixedArticle } from '../../utils';
import { refactoredChange, articleStatus } from '../../types';
import axios, { AxiosError } from 'axios';
import { RootState, AppThunk } from '../../app/store';

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
				state.status = 'doneModification';
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
			state.adjustmentObjectArr = result;
			state.status = 'reviving';
			state.appliedAdjustments = 0; // reset
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
			state.status = 'doneModification';
		},
		loadDataFromSessionStorage: (state) => {
			let data = sessionStorage.getItem('grammarFixes');
			if (data !== null) {
				let { adjustmentObjectArr, allAdjustmentsCount } = JSON.parse(data);
				state.adjustmentObjectArr = adjustmentObjectArr;
				state.allAdjustmentsCount = allAdjustmentsCount;
				state.appliedAdjustments = 0;
				state.status = 'modifying';
			}
		},
		prepareForReFetchingGrammarMistakes: (state) => {
			state.initialArticle = state.grammarFixedArticle;
			state.grammarFixedArticle = '';
		},
	},
	extraReducers(builder) {
		builder
			.addCase(findGrammarMistakes.pending, (state) => {
				state.fixGrammarLoading = 'loading';
			})
			.addCase(findGrammarMistakes.fulfilled, (state, action) => {
				let result = findTheDiffsBetweenTwoStrings(state.initialArticle, action.payload['choices'][0]['message']['content']);

				state.adjustmentObjectArr = result;
				state.fixGrammarLoading = 'done';
				state.status = 'modifying';
				state.appliedAdjustments = 0;
				state.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
					if (!cur.value) {
						acc += 1;
					}
					return acc;
				}, 0);

				let localData = JSON.stringify({ adjustmentObjectArr: state.adjustmentObjectArr, allAdjustmentsCount: state.allAdjustmentsCount });
				sessionStorage.setItem('grammarFixes', localData);
			})
			.addCase(findGrammarMistakes.rejected, (state) => {
				state.fixGrammarLoading = 'done';
			});
	},
});

export var selectArticle = (state: RootState) => state.article;

export var reFetchGrammarMistakes = (): AppThunk => {
	return (dispatch, getState) => {
		let article = selectArticle(getState());
		if (article.grammarFixedArticle === article.initialArticle) {
			dispatch(loadDataFromSessionStorage());
		} else {
			dispatch(prepareForReFetchingGrammarMistakes());
			dispatch(findGrammarMistakes(article.grammarFixedArticle));
		}
	};
};

export var {
	saveInput,
	ignoreSingleAdjustment,
	acceptSingleAdjustment,
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentArticleState,
	revertToBeginning,
	loadDataFromSessionStorage,
	prepareForReFetchingGrammarMistakes,
} = articleSlice.actions;

export default articleSlice.reducer;
