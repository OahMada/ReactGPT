import { refactoredChange } from '../types';

export var updateGrammarFixedArticle = (arr: refactoredChange[]) => {
	return arr.reduce<string>((acc, cur) => {
		if (cur.value) {
			acc += cur.value;
		} else if (cur.removed) {
			acc += cur.removedValue;
		}
		return acc;
	}, '');
};
