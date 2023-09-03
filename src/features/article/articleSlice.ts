import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findTheDiffsBetweenTwoStrings, sanitizeUserInput, updateGrammarFixedArticle } from '../../utils';
import { refactoredChange, paragraphStatus, articleStatus } from '../../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';
import { RootState, AppThunk } from '../../app/store';
import { v4 as uuidv4 } from 'uuid';

let defaultString = `A voiced consonant (or sound) means that it uses the vocal cords and they produce a vibration or humming sound in the throat when they are said. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck / throat. That is because it is a voiced sound.

A voiceless sound (sometimes called an unvoiced sound) is when there is no vibration in your throat and the sound comes from the mouth area. Pronounce the letter P. You will notice how it comes from your mouth (in fact near your lips at the front of your mouth). The P sound doesn't come from your throat.`;

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
	fixGrammarLoadingAborter: (() => void) | null;
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
	fixGrammarLoadingAborter: null,
};

interface Article {
	userInput: string;
	status: articleStatus;
	paragraphs: Paragraph[];
	error: string | null | undefined;
}

let initialArticleState: Article = {
	userInput: defaultString,
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
							'You are an English learning assistant. You are going to fix only the grammar mistakes in the essay the user passes to you. In the process, you have to make as few edits as possible. If there are no grammar mistakes, simply return the essay back please.',
					},
					{ role: 'user', content: currentParagraph.paragraphBeforeGrammarFix },
				],
			},
			{ headers: { 'content-type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` }, signal: thunkAPI.signal }
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

			// when you add a new paragraph to the list
			if (!currentParagraph.initialParagraph) {
				currentParagraph.initialParagraph = currentParagraph.paragraphBeforeGrammarFix;
			}
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
		deleteParagraph: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraphIndex = paragraphs.findIndex((item) => item.id === payload);
			if (paragraphs[currentParagraphIndex].fixGrammarLoadingAborter !== null) {
				console.log(paragraphs[currentParagraphIndex].fixGrammarLoadingAborter);
				paragraphs[currentParagraphIndex].fixGrammarLoadingAborter?.();
			}
			paragraphs.splice(currentParagraphIndex, 1);
		},
		insertAboveParagraph: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraphIndex = paragraphs.findIndex((item) => item.id === payload);
			console.log(currentParagraphIndex);

			let newParagraph = Object.assign({}, initialParagraphState);
			newParagraph.paragraphStatus = 'editing';
			newParagraph.id = uuidv4();
			newParagraph.paragraphBeforeGrammarFix = '';

			paragraphs.splice(currentParagraphIndex, 0, newParagraph);
		},
		insertBelowParagraph: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraphIndex = paragraphs.findIndex((item) => item.id === payload);
			let newParagraph = Object.assign({}, initialParagraphState);
			newParagraph.paragraphStatus = 'editing';
			newParagraph.id = uuidv4();
			paragraphs.splice(currentParagraphIndex + 1, 0, newParagraph);
		},
		reEnterArticle: (state) => {
			state.userInput = '';
			state.paragraphs = [];
			state.status = 'acceptingUserInput';
			state.error = null;
		},
		loadFixGrammarLoadingAborter: (
			{ paragraphs },
			{ payload: { aborter, paragraphId } }: PayloadAction<{ aborter: () => void; paragraphId: string }>
		) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
			currentParagraph.fixGrammarLoadingAborter = aborter;
		},
		handleParagraphOrderChange: (
			{ paragraphs },
			{ payload: { dragTargetId, dropTargetId } }: PayloadAction<{ dragTargetId: string; dropTargetId: string }>
		) => {
			// put dargTarget before drop target
			let dragTargetParagraphIndex = paragraphs.findIndex((item) => item.id === dragTargetId);
			let dropTargetParagraphIndex = paragraphs.findIndex((item) => item.id === dropTargetId);
			let dragTargetParagraph = paragraphs[dragTargetParagraphIndex];

			paragraphs.splice(dragTargetParagraphIndex, 1);
			paragraphs.splice(dropTargetParagraphIndex, 0, dragTargetParagraph);
		},
	},
	extraReducers(builder) {
		builder
			.addCase(findGrammarMistakes.pending, ({ paragraphs }, { meta: { arg } }) => {
				let currentParagraph = paragraphs.find((item) => item.id === arg);
				if (currentParagraph) {
					currentParagraph.fixGrammarLoading = 'loading';
				}
			})
			.addCase(findGrammarMistakes.fulfilled, ({ paragraphs }, { payload, meta: { arg } }) => {
				let currentParagraph = paragraphs.find((item) => item.id === arg);
				// paragraph can be deleted
				if (currentParagraph) {
					// when the paragraph get edited, user want to compare to the edited version
					let result = findTheDiffsBetweenTwoStrings(currentParagraph.paragraphBeforeGrammarFix, payload);

					currentParagraph.adjustmentObjectArr = result;
					currentParagraph.fixGrammarLoading = 'done';
					currentParagraph.paragraphStatus = 'modifying';
					currentParagraph.fixGrammarLoadingAborter = null;
					currentParagraph.allAdjustmentsCount = result.reduce<number>((acc, cur) => {
						if (!cur.value) {
							acc += 1;
						}
						return acc;
					}, 0);
				}
			})
			.addCase(findGrammarMistakes.rejected, ({ paragraphs, error }, action) => {
				let currentParagraph = paragraphs.find((item) => item.id === action.meta.arg);
				if (currentParagraph) {
					currentParagraph.fixGrammarLoading = 'done';
					currentParagraph.fixGrammarLoadingAborter = null;
					if (action.payload) {
						currentParagraph.error = action.payload;
					} else {
						console.log(action.error.message);
					}
				}
			});
	},
});

export var selectArticle = (state: RootState) => state.article;

// thunks
// useful when user tries to re-send api call with the same paragraph of article with edits
export var reFetchGrammarMistakes = (id: string): AppThunk => {
	return (dispatch) => {
		dispatch(updateParagraphBeforeGrammarFixContent(id));
		dispatch(findGrammarMistakes(id));
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
			let { abort } = dispatch(findGrammarMistakes(paragraph.id));
			dispatch(
				loadFixGrammarLoadingAborter({
					aborter: () => {
						abort();
					},
					paragraphId: paragraph.id,
				})
			);
		});
	};
};

export var deleteParagraphs = (id: string): AppThunk => {
	return (dispatch, getState) => {
		dispatch(deleteParagraph(id));
		let { paragraphs } = selectArticle(getState());
		if (paragraphs.length === 0) {
			dispatch(reEnterArticle());
		}
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
	updateParagraphBeforeGrammarFixContent,
	prepareForUserInputUpdate,
	saveParagraphInput,
	deleteParagraph,
	insertAboveParagraph,
	insertBelowParagraph,
	reEnterArticle,
	loadFixGrammarLoadingAborter,
	handleParagraphOrderChange,
} = articleSlice.actions;

export default articleSlice.reducer;
