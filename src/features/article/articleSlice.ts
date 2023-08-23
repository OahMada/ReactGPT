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
			throw error;
		}
	}
});

let articleSlice = createSlice({
	name: 'article',
	initialState,
	reducers: {
		saveInput: (state, action: PayloadAction<string>) => {
			let input = sanitizeUserInput(action.payload);
			state.initialArticle = input;

			let cachedUserInput = sessionStorage.getItem('initialUserInput');
			if (cachedUserInput === null) {
				sessionStorage.setItem('initialUserInput', input);
			}
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
				state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr); // required when manually accept all adjustments

				// reset state properties that is staled
				state.adjustmentObjectArr = [];
				state.appliedAdjustments = 0;
				state.allAdjustmentsCount = 0;
			}
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
				state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr); // required when manually ignore all adjustments

				// reset state properties that is staled
				state.adjustmentObjectArr = [];
				state.appliedAdjustments = 0;
				state.allAdjustmentsCount = 0;
			}
		},
		// also used for revert changes made when reviewing the applied edits
		acceptAllAdjustments: (state) => {
			state.adjustmentObjectArr = state.adjustmentObjectArr.reduce<refactoredChange[]>((acc, cur) => {
				if (cur.value) {
					acc.push(cur);
				} else if (cur.added) {
					cur.value = cur.addedValue; // user accepted version of article is calculated by the value property of adjustmentObjectArr
					acc.push(cur);
				}
				return acc;
			}, []);
			state.status = 'doneModification';
			state.grammarFixedArticle = updateGrammarFixedArticle(state.adjustmentObjectArr);

			// reset state properties that is staled
			state.adjustmentObjectArr = [];
			state.appliedAdjustments = 0;
			state.allAdjustmentsCount = 0;
		},
		// also used for finish reviewing edit history
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

			// reset state properties that is staled
			state.adjustmentObjectArr = [];
			state.appliedAdjustments = 0;
			state.allAdjustmentsCount = 0;
		},
		checkEditHistory: (state) => {
			let result = findTheDiffsBetweenTwoStrings(state.grammarFixedArticle, state.initialArticle);
			state.adjustmentObjectArr = result;
			state.status = 'reviving';
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
			state.status = 'doneModification'; // when in reviewing phase it's needed

			// reset state properties that is staled
			state.adjustmentObjectArr = [];
			state.appliedAdjustments = 0;
			state.allAdjustmentsCount = 0;
		},
		loadDataFromSessionStorage: (state) => {
			let data = sessionStorage.getItem('grammarFixes');
			if (data !== null) {
				let { adjustmentObjectArr, allAdjustmentsCount } = JSON.parse(data);
				state.adjustmentObjectArr = adjustmentObjectArr;
				state.allAdjustmentsCount = allAdjustmentsCount;
				state.fixGrammarLoading = 'done'; // when webpage refreshed, the same content is passed to userInput, and there are API call data cache
				state.status = 'modifying';
			}
		},
		updateInitialArticleContent: (state) => {
			state.initialArticle = state.grammarFixedArticle; // it's always the initialArticle get sent to API call
			state.grammarFixedArticle = '';

			// reset state properties that is staled
			state.adjustmentObjectArr = [];
			state.appliedAdjustments = 0;
			state.allAdjustmentsCount = 0;
		},
		prepareForUserInputUpdate: (state) => {
			state.status = 'editing';
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
				state.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
					if (!cur.value) {
						acc += 1;
					}
					return acc;
				}, 0);

				let localData = sessionStorage.getItem('grammarFixes');
				if (localData === null) {
					localData = JSON.stringify({ adjustmentObjectArr: state.adjustmentObjectArr, allAdjustmentsCount: state.allAdjustmentsCount });
					sessionStorage.setItem('grammarFixes', localData);
				}
			})
			.addCase(findGrammarMistakes.rejected, (state, action) => {
				state.fixGrammarLoading = 'done';
				// if (action.payload) {
				// Being that we passed in ValidationErrors to rejectType in `createAsyncThunk`, the payload will be available here.
				// 	state.error = action.payload.errorMessage;
				// } else {
				// 	state.error = action.error.message;
				// }
			});
	},
});

export var selectArticle = (state: RootState) => state.article;

// useful when user tries to re-send api call with the same paragraph of article with edits
export var reFetchGrammarMistakes = (): AppThunk => {
	return (dispatch, getState) => {
		dispatch(updateInitialArticleContent());
		let article = selectArticle(getState());
		let cachedUserInput = sessionStorage.getItem('initialUserInput');
		if (cachedUserInput === article.initialArticle) {
			dispatch(loadDataFromSessionStorage());
		} else {
			dispatch(findGrammarMistakes(article.initialArticle));
		}
	};
};

// for click the article enter editing mode
export var updateUserInput = (): AppThunk => {
	return (dispatch) => {
		dispatch(prepareForUserInputUpdate());
		dispatch(updateInitialArticleContent()); // initialArticle is what get displayed in the textarea element
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
	updateInitialArticleContent,
	prepareForUserInputUpdate,
} = articleSlice.actions;

export default articleSlice.reducer;
