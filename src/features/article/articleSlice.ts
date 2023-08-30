import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findTheDiffsBetweenTwoStrings, sanitizeUserInput, updateGrammarFixedArticle } from '../../utils';
import { refactoredChange, paragraphStatus, articleStatus } from '../../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';
import { RootState, AppThunk } from '../../app/store';
import { v4 as uuidv4 } from 'uuid';

export interface Paragraph {
	id: string;
	paragraphStatus: paragraphStatus;
	initialParagraph: string;
	paragraphBeforeGrammarFix: string;
	paragraphAfterGrammarFix: string;
	adjustmentObjectArr: refactoredChange[];
	fixGrammarLoading: 'loading' | 'done';
	allAdjustmentsCount: number;
	appliedAdjustments: number;
	error: string | null | undefined;
}

let initialParagraphState: Paragraph = {
	id: '',
	paragraphStatus: 'modifying',
	initialParagraph: '',
	paragraphBeforeGrammarFix: '',
	paragraphAfterGrammarFix: '',
	adjustmentObjectArr: [],
	fixGrammarLoading: 'done',
	allAdjustmentsCount: 0,
	appliedAdjustments: 0,
	error: null,
};

interface Article {
	userInput: string;
	status: articleStatus;
	paragraphs: Paragraph[];
	error: string | null | undefined;
}

let initialArticleState: Article = {
	userInput: '',
	status: 'acceptingUserInput',
	paragraphs: [],
	error: null,
};

export var findGrammarMistakes = createAsyncThunk<
	// Return type of the payload creator
	string,
	// First argument to the payload creator
	string,
	{
		// Optional fields for defining thunkApi field types
		state: RootState;
		rejectValue: string;
	}
>('article/findGrammarMistakes', async (paragraphId, thunkAPI) => {
	let paragraphs = thunkAPI.getState().article.paragraphs;
	let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
	try {
		let response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'You are an English learning assistant. You are going to fix only the grammar mistakes in the essay the user passes to you. In the process, you have to make as few edits as possible.',
					},
					{ role: 'user', content: currentParagraph.paragraphBeforeGrammarFix },
				],
			},
			{ headers: { 'content-type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` } }
		);

		return response.data['choices'][0]['message']['content'];
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
	initialState: initialArticleState,
	reducers: {
		saveInput: (state, action: PayloadAction<string>) => {
			let input = sanitizeUserInput(action.payload);
			state.userInput = input;
			let paragraphs = input.split(/\n\n/);
			state.paragraphs = paragraphs.map((paragraph) => {
				let obj = Object.assign({}, initialParagraphState);
				obj.initialParagraph = paragraph;
				obj.paragraphBeforeGrammarFix = paragraph;
				obj.id = uuidv4();
				return obj;
			});
			state.status = 'errorFixing';

			let cachedUserInput = sessionStorage.getItem('initialParagraphs');
			if (cachedUserInput === null) {
				sessionStorage.setItem('initialParagraphs', JSON.stringify(state.paragraphs));
			}
		},
		saveParagraphInput: (
			{ paragraphs },
			{ payload: { paragraphInput, paragraphId } }: PayloadAction<{ paragraphInput: string; paragraphId: string }>
		) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
			currentParagraph.paragraphBeforeGrammarFix = paragraphInput;
			currentParagraph.paragraphStatus = 'modifying';
		},
		// also be used when revert one adjustment
		acceptSingleAdjustment: (
			{ paragraphs },
			{ payload: { indexInParagraph, paragraphId } }: PayloadAction<{ indexInParagraph: number; paragraphId: string }>
		) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
			let targetObj = currentParagraph.adjustmentObjectArr[indexInParagraph];
			if (targetObj.added) {
				targetObj.value = targetObj.addedValue;
			} else {
				currentParagraph.adjustmentObjectArr.splice(indexInParagraph, 1);
			}
			currentParagraph.appliedAdjustments += 1;
			if (currentParagraph.allAdjustmentsCount === currentParagraph.appliedAdjustments) {
				currentParagraph.paragraphStatus = 'doneModification';
				currentParagraph.paragraphAfterGrammarFix = updateGrammarFixedArticle(currentParagraph.adjustmentObjectArr); // required when manually accept all adjustments

				// reset state properties that is staled
				currentParagraph.adjustmentObjectArr = [];
				currentParagraph.appliedAdjustments = 0;
				currentParagraph.allAdjustmentsCount = 0;
			}
		},
		ignoreSingleAdjustment: (
			{ paragraphs },
			{ payload: { indexInParagraph, paragraphId } }: PayloadAction<{ indexInParagraph: number; paragraphId: string }>
		) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
			let targetObj = currentParagraph.adjustmentObjectArr[indexInParagraph];
			if (targetObj.removed) {
				targetObj.value = targetObj.removedValue;
			} else {
				currentParagraph.adjustmentObjectArr.splice(indexInParagraph, 1);
			}
			currentParagraph.allAdjustmentsCount -= 1;
			if (currentParagraph.allAdjustmentsCount === 0) {
				currentParagraph.paragraphStatus = 'doneModification';
				currentParagraph.paragraphAfterGrammarFix = updateGrammarFixedArticle(currentParagraph.adjustmentObjectArr); // required when manually ignore all adjustments

				// reset currentParagraph properties that is staled
				currentParagraph.adjustmentObjectArr = [];
				currentParagraph.appliedAdjustments = 0;
				currentParagraph.allAdjustmentsCount = 0;
			}
		},
		// also used for revert changes made when reviewing the applied edits
		acceptAllAdjustments: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			currentParagraph.adjustmentObjectArr = currentParagraph.adjustmentObjectArr.reduce<refactoredChange[]>((acc, cur) => {
				if (cur.value) {
					acc.push(cur);
				} else if (cur.added) {
					cur.value = cur.addedValue; // user accepted version of article is calculated by the value property of adjustmentObjectArr
					acc.push(cur);
				}
				return acc;
			}, []);
			currentParagraph.paragraphStatus = 'doneModification';
			currentParagraph.paragraphAfterGrammarFix = updateGrammarFixedArticle(currentParagraph.adjustmentObjectArr);

			// reset state properties that is staled
			currentParagraph.adjustmentObjectArr = [];
			currentParagraph.appliedAdjustments = 0;
			currentParagraph.allAdjustmentsCount = 0;
		},
		// also used for finish reviewing edit history
		doneWithCurrentParagraphState: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			currentParagraph.adjustmentObjectArr = currentParagraph.adjustmentObjectArr.reduce<refactoredChange[]>((acc, cur) => {
				if (cur.value) {
					acc.push(cur);
				} else if (cur.removed) {
					cur.value = cur.removedValue;
					acc.push(cur);
				}
				return acc;
			}, []);
			currentParagraph.paragraphStatus = 'doneModification';
			currentParagraph.paragraphAfterGrammarFix = updateGrammarFixedArticle(currentParagraph.adjustmentObjectArr);

			// reset state properties that is staled
			currentParagraph.adjustmentObjectArr = [];
			currentParagraph.appliedAdjustments = 0;
			currentParagraph.allAdjustmentsCount = 0;
		},
		checkEditHistory: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			let result = findTheDiffsBetweenTwoStrings(currentParagraph.paragraphAfterGrammarFix, currentParagraph.initialParagraph);
			currentParagraph.adjustmentObjectArr = result;
			currentParagraph.paragraphStatus = 'reviving';
			// for logic to work where when none available adjustments are left, change paragraphStatus
			currentParagraph.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
				if (!cur.value) {
					acc += 1;
				}
				return acc;
			}, 0);
		},
		revertToBeginning: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			currentParagraph.paragraphAfterGrammarFix = currentParagraph.initialParagraph;
			currentParagraph.paragraphStatus = 'doneModification'; // when in reviewing phase it's needed

			// reset state properties that is staled
			currentParagraph.adjustmentObjectArr = [];
			currentParagraph.appliedAdjustments = 0;
			currentParagraph.allAdjustmentsCount = 0;
		},
		// loadDataFromSessionStorage: (state) => {
		// 	let data = sessionStorage.getItem('grammarFixes');
		// 	if (data !== null) {
		// 		let { adjustmentObjectArr, allAdjustmentsCount } = JSON.parse(data);
		// 		state.adjustmentObjectArr = adjustmentObjectArr;
		// 		state.allAdjustmentsCount = allAdjustmentsCount;
		// 		state.fixGrammarLoading = 'done'; // when webpage refreshed, the same content is passed to userInput, and there are API call data cache
		// 		state.status = 'modifying';
		// 	}
		// },
		updateParagraphBeforeGrammarFixContent: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;

			currentParagraph.paragraphBeforeGrammarFix = currentParagraph.paragraphAfterGrammarFix; // it's always the initialArticle get sent to API call
			currentParagraph.paragraphStatus = 'modifying';
			// reset state properties that is staled
			currentParagraph.adjustmentObjectArr = [];
			currentParagraph.appliedAdjustments = 0;
			currentParagraph.allAdjustmentsCount = 0;
			currentParagraph.paragraphAfterGrammarFix = '';
		},
		prepareForUserInputUpdate: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			currentParagraph.paragraphStatus = 'editing';
		},
	},
	extraReducers(builder) {
		builder
			.addCase(findGrammarMistakes.pending, ({ paragraphs }, { meta: { arg } }) => {
				let currentParagraph = paragraphs.find((item) => item.id === arg) as Paragraph;
				currentParagraph.fixGrammarLoading = 'loading';
			})
			.addCase(findGrammarMistakes.fulfilled, ({ paragraphs }, { payload, meta: { arg } }) => {
				let currentParagraph = paragraphs.find((item) => item.id === arg) as Paragraph;
				// when the paragraph get edited, user want to compare to the edited version
				let result = findTheDiffsBetweenTwoStrings(currentParagraph.paragraphBeforeGrammarFix, payload);

				currentParagraph.adjustmentObjectArr = result;
				currentParagraph.fixGrammarLoading = 'done';
				currentParagraph.paragraphStatus = 'modifying';
				currentParagraph.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
					if (!cur.value) {
						acc += 1;
					}
					return acc;
				}, 0);

				// TODO
				// let localData = sessionStorage.getItem('grammarFixes');
				// if (localData === null) {
				// 	localData = JSON.stringify({ adjustmentObjectArr: state.adjustmentObjectArr, allAdjustmentsCount: state.allAdjustmentsCount });
				// 	sessionStorage.setItem('grammarFixes', localData);
				// }
			})
			.addCase(findGrammarMistakes.rejected, ({ paragraphs, error }, { payload, meta: { arg } }) => {
				let currentParagraph = paragraphs.find((item) => item.id === arg) as Paragraph;
				currentParagraph.fixGrammarLoading = 'done';
				if (payload) {
					currentParagraph.error = payload;
				} else {
					error = payload;
				}
			});
	},
});

export var selectArticle = (state: RootState) => state.article;

// useful when user tries to re-send api call with the same paragraph of article with edits
export var reFetchGrammarMistakes = (id: string): AppThunk => {
	return (dispatch, getState) => {
		dispatch(updateParagraphBeforeGrammarFixContent(id));
		// let { paragraphs } = selectArticle(getState());
		// let cachedUserInput = sessionStorage.getItem('initialUserInput');
		// if (cachedUserInput === article.initialArticle) {
		// 	dispatch(loadDataFromSessionStorage());
		// } else {
		dispatch(findGrammarMistakes(id));
		// }
	};
};

// for click the article enter editing mode
export var updateUserInput = (id: string): AppThunk => {
	return (dispatch) => {
		dispatch(updateParagraphBeforeGrammarFixContent(id)); // initialArticle is what get displayed in the textarea element
		dispatch(prepareForUserInputUpdate(id));
	};
};

// the calls to API has to be in a thunk, why?
export var findArticleGrammarMistakes = (): AppThunk => {
	return (dispatch, getState) => {
		let { paragraphs } = selectArticle(getState());
		paragraphs.forEach((paragraph) => {
			dispatch(findGrammarMistakes(paragraph.id));
		});
	};
};

export var {
	saveInput,
	ignoreSingleAdjustment,
	acceptSingleAdjustment,
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentParagraphState,
	revertToBeginning,
	// loadDataFromSessionStorage,
	updateParagraphBeforeGrammarFixContent,
	prepareForUserInputUpdate,
	saveParagraphInput,
} = articleSlice.actions;

export default articleSlice.reducer;
