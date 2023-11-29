export interface ModifiedObj {
	addedValue?: string;
	removedValue?: string;
	added?: boolean;
	removed?: boolean;
}

export interface refactoredChange extends ModifiedObj {
	[index: string]: string | undefined | boolean;
	value?: string;
}

export type paragraphStatus = 'editing' | 'modifying' | 'doneModification' | 'reviving' | null;

export type EditHistoryMode = 'paragraphCreation' | 'paragraphLastEdit';

export interface Paragraph {
	id: string;
	articleId: string;
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
	showTranslation: boolean;
	editDate: number;
}

export interface PartialParagraph {
	paragraphText: string;
	paragraphId: string;
}

export type PartialParagraphWithTranslation = PartialParagraph & {
	translationText: string;
};
