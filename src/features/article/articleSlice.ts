import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { v4 as uuidv4 } from 'uuid';

import { findTheDiffsBetweenTwoStrings, sanitizeUserInput, updateGrammarFixedArticle } from '../../utils';
import { refactoredChange, paragraphStatus, articleStatus } from '../../types';
import { RootState, AppThunk } from '../../app/store';

export interface Paragraph {
	id: string;
	paragraphStatus: paragraphStatus;
	initialParagraph: string;
	paragraphBeforeGrammarFix: string;
	paragraphAfterGrammarFix: string;
	adjustmentObjectArr: refactoredChange[];
	allAdjustmentsCount: number;
	appliedAdjustments: number;
}

let initialParagraphState: Paragraph = {
	id: '',
	paragraphStatus: 'modifying',
	initialParagraph: '',
	paragraphBeforeGrammarFix: '',
	paragraphAfterGrammarFix: '',
	adjustmentObjectArr: [],
	allAdjustmentsCount: 0,
	appliedAdjustments: 0,
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
		},
		saveParagraphInput: (
			{ paragraphs },
			{ payload: { paragraphInput, paragraphId } }: PayloadAction<{ paragraphInput: string; paragraphId: string }>
		) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
			currentParagraph.paragraphBeforeGrammarFix = sanitizeUserInput(paragraphInput);
			currentParagraph.paragraphStatus = 'modifying';

			// when you add a new paragraph to the list
			if (!currentParagraph.initialParagraph) {
				currentParagraph.initialParagraph = currentParagraph.paragraphBeforeGrammarFix;
			}
		},
		populateParagraphLocalState: ({ paragraphs }, { payload: { paragraphId, data } }) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;

			currentParagraph.adjustmentObjectArr = data;
			currentParagraph.paragraphStatus = 'modifying';
			currentParagraph.allAdjustmentsCount = currentParagraph.adjustmentObjectArr.reduce<number>((acc, cur) => {
				if (!cur.value) {
					acc += 1;
				}
				return acc;
			}, 0);
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

			// too early, would trigger unnecessary useQuery call
			currentParagraph.paragraphBeforeGrammarFix = currentParagraph.paragraphAfterGrammarFix;
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
			paragraphs.splice(currentParagraphIndex, 1);
		},
		insertAboveParagraph: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraphIndex = paragraphs.findIndex((item) => item.id === payload);

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
});

export var selectArticle = (state: RootState) => state.article;

// thunks
// useful when user tries to re-send api call with the same paragraph of article with edits
export var reFetchGrammarMistakes = (id: string): AppThunk => {
	return (dispatch) => {
		dispatch(updateParagraphBeforeGrammarFixContent(id));
	};
};

// for click the article enter editing mode
export var updateUserInput = (id: string): AppThunk => {
	return (dispatch) => {
		dispatch(updateParagraphBeforeGrammarFixContent(id)); // initialArticle is what get displayed in the textarea element
		dispatch(prepareForUserInputUpdate(id));
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
	populateParagraphLocalState,
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
	handleParagraphOrderChange,
} = articleSlice.actions;

export default articleSlice.reducer;
