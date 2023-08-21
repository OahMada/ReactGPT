import { refactoredChange } from '../types';

export var updateGrammarFixedArticle = (arr: refactoredChange[]) => {
	return arr.reduce<string>((acc, cur) => {
		acc += cur.value;
		return acc;
	}, '');
};
