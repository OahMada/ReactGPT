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

export type articleStatus = 'editing' | 'modifying' | 'doneModification' | 'reviving' | 'intermediate';
