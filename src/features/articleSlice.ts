import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { v4 as uuidv4 } from 'uuid';

import { findTheDiffsBetweenTwoStrings, sanitizeUserInput, updateGrammarFixedArticle, createToast } from '../utils';
import { refactoredChange, paragraphStatus, articleStatus } from '../types';
import { RootState, AppThunk } from '../app/store';

export type EditHistoryMode = 'paragraphCreation' | 'paragraphLastEdit';

export interface Paragraph {
	id: string;
	paragraphStatus: paragraphStatus;
	initialParagraph: string;
	updatedInitialParagraph: string;
	paragraphBeforeGrammarFix: string;
	paragraphAfterGrammarFix: string;
	adjustmentObjectArr: refactoredChange[];
	allAdjustmentsCount: number;
	appliedAdjustments: number;
	cancelQuery: boolean;
	editHistoryMode: EditHistoryMode;
}

let initialParagraphState: Paragraph = {
	id: '',
	paragraphStatus: 'modifying',
	initialParagraph: '',
	updatedInitialParagraph: '',
	paragraphBeforeGrammarFix: '',
	paragraphAfterGrammarFix: '',
	adjustmentObjectArr: [],
	allAdjustmentsCount: 0,
	appliedAdjustments: 0,
	cancelQuery: false,
	editHistoryMode: 'paragraphCreation',
};

interface Article {
	userInput: string;
	status: articleStatus;
	paragraphs: Paragraph[];
	paragraphRemoveQueue: Paragraph['id'][];
}

let initialArticleState: Article = {
	userInput: '',
	status: 'acceptingUserInput',
	paragraphs: [],
	paragraphRemoveQueue: [],
};

let articleSlice = createSlice({
	name: 'article',
	initialState: initialArticleState,
	reducers: {
		saveArticleInput: (state, action: PayloadAction<string>) => {
			let input = sanitizeUserInput(action.payload);
			state.userInput = input;
			let paragraphs = input.split(/\n\n/);
			state.paragraphs = paragraphs.map((paragraph) => {
				let obj = Object.assign({}, initialParagraphState);
				obj.initialParagraph = paragraph;
				obj.updatedInitialParagraph = paragraph;
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
			// when you add a new paragraph to the list
			if (!currentParagraph.initialParagraph) {
				currentParagraph.initialParagraph = currentParagraph.paragraphBeforeGrammarFix;
			}
			currentParagraph.updatedInitialParagraph = sanitizeUserInput(paragraphInput);
			currentParagraph.paragraphBeforeGrammarFix = sanitizeUserInput(paragraphInput);
			// second part of the condition is for bypass the unwanted modifying state
			if (currentParagraph.adjustmentObjectArr.length === 0 && currentParagraph.cancelQuery === true) {
				currentParagraph.paragraphStatus = 'doneModification';
			} else {
				currentParagraph.paragraphStatus = 'modifying';
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

			if (currentParagraph.allAdjustmentsCount === 0) {
				createToast({ type: 'info', content: 'None grammar mistakes found.', toastId: 'none grammar mistakes' });
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
			currentParagraph.cancelQuery = true;

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
			currentParagraph.cancelQuery = true;

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
			currentParagraph.cancelQuery = true;

			// reset state properties that is staled
			currentParagraph.adjustmentObjectArr = [];
			currentParagraph.appliedAdjustments = 0;
			currentParagraph.allAdjustmentsCount = 0;
		},
		checkEditHistory: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			let result: refactoredChange[] = [];
			if (currentParagraph.editHistoryMode === 'paragraphCreation') {
				result = findTheDiffsBetweenTwoStrings(currentParagraph.paragraphAfterGrammarFix, currentParagraph.initialParagraph);
			} else if (currentParagraph.editHistoryMode === 'paragraphLastEdit') {
				result = findTheDiffsBetweenTwoStrings(currentParagraph.paragraphAfterGrammarFix, currentParagraph.updatedInitialParagraph);
			}
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
		updateParagraphBeforeGrammarFixState: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;

			if (currentParagraph.paragraphAfterGrammarFix !== '') {
				// when the network error happens, the paragraphAfterGrammarFix would be empty
				currentParagraph.paragraphBeforeGrammarFix = currentParagraph.paragraphAfterGrammarFix;
			}
			currentParagraph.paragraphStatus = 'modifying';
			// reset state properties that is staled
			currentParagraph.adjustmentObjectArr = [];
			currentParagraph.appliedAdjustments = 0;
			currentParagraph.allAdjustmentsCount = 0;
		},
		prepareForUserUpdateParagraph: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			currentParagraph.paragraphStatus = 'editing';
		},
		deleteParagraphRightAway: ({ paragraphs }, { payload }: PayloadAction<string>) => {
			let currentParagraphIndex = paragraphs.findIndex((item) => item.id === payload);
			paragraphs.splice(currentParagraphIndex, 1);
		},
		finishParagraphDeletion: (state, { payload }) => {
			if (state.paragraphRemoveQueue.includes(payload)) {
				let currentParagraphIndex = state.paragraphs.findIndex((item) => item.id === payload);
				state.paragraphs.splice(currentParagraphIndex, 1);
				state.paragraphRemoveQueue = state.paragraphRemoveQueue.filter((id) => id !== payload);
			}
		},
		addParagraphToDeletionQueue: ({ paragraphRemoveQueue }, { payload }) => {
			paragraphRemoveQueue.push(payload);
		},
		undoParagraphDeletion: (state, { payload }) => {
			state.paragraphRemoveQueue = state.paragraphRemoveQueue.filter((id) => id !== payload);
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
		},
		handleParagraphOrderChange: (
			{ paragraphs },
			{ payload: { destinationIndex, sourceIndex } }: PayloadAction<{ destinationIndex: number; sourceIndex: number }>
		) => {
			// put dargTarget before drop target
			let [dragTargetParagraph] = paragraphs.splice(sourceIndex, 1);
			paragraphs.splice(destinationIndex, 0, dragTargetParagraph);
		},
		disableCancelQueryState: ({ paragraphs }, { payload }) => {
			let currentParagraph = paragraphs.find((item) => item.id === payload) as Paragraph;
			currentParagraph.cancelQuery = false;
		},
		alterCheckEditHistoryMode: (
			{ paragraphs },
			{ payload: { paragraphId, mode } }: PayloadAction<{ mode: EditHistoryMode; paragraphId: string }>
		) => {
			let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
			currentParagraph.editHistoryMode = mode;
		},
	},
});

export var selectArticle = (state: RootState) => state.article;

// thunks
// useful when user tries to re-send api call with the same paragraph of article with edits
export var reFetchGrammarMistakes = (id: string): AppThunk => {
	return (dispatch) => {
		dispatch(updateParagraphBeforeGrammarFixState(id));
		dispatch(disableCancelQueryState(id));
	};
};

// for click the article enter editing mode
export var updateUserInput = (id: string): AppThunk => {
	return (dispatch) => {
		dispatch(updateParagraphBeforeGrammarFixState(id)); // paragraphBeforeGrammarFix is what get displayed in the textarea element
		dispatch(prepareForUserUpdateParagraph(id));
	};
};

export var {
	saveArticleInput,
	populateParagraphLocalState,
	ignoreSingleAdjustment,
	acceptSingleAdjustment,
	acceptAllAdjustments,
	checkEditHistory,
	doneWithCurrentParagraphState,
	revertToBeginning,
	updateParagraphBeforeGrammarFixState,
	prepareForUserUpdateParagraph,
	saveParagraphInput,
	finishParagraphDeletion,
	insertAboveParagraph,
	insertBelowParagraph,
	reEnterArticle,
	handleParagraphOrderChange,
	disableCancelQueryState,
	addParagraphToDeletionQueue,
	undoParagraphDeletion,
	deleteParagraphRightAway,
	alterCheckEditHistoryMode,
} = articleSlice.actions;

export default articleSlice.reducer;
