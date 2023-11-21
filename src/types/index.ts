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

export interface PartialParagraph {
	paragraphText: string;
	paragraphId: string;
}
