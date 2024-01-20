import { diffWords } from 'diff';
import { refactoredChange } from '../types';

export var findTheDiffsBetweenTwoStrings = (strA: string, strB: string) => {
	let result = diffWords(strA, strB);
	let refactoredResult = result
		// remove redundant properties and reshape change objects
		.reduce<refactoredChange[]>((acc, cur) => {
			if (cur.added || cur.removed) {
				// one change alone
				if (cur.added) {
					acc.push({ addedValue: cur.value, added: true });
				}
				if (cur.removed) {
					acc.push({ removedValue: cur.value, removed: true });
				}
			} else {
				// non changes
				acc.push({ value: cur.value });
			}
			return acc;
		}, [])
		// combine changed value
		.reduce<refactoredChange[]>((acc, cur) => {
			// two adjacent changes
			let previousObj = acc[acc.length - 1];

			if (acc.length >= 1 && (previousObj?.added || previousObj?.removed) && (cur.added || cur.removed)) {
				// concat same string keys
				Object.keys(cur).forEach((key) => {
					/* v8 ignore next 3 */
					if (previousObj[key] && typeof previousObj[key] === 'string') {
						cur[key] = String(previousObj[key]) + cur[key];
					}
				});
				// add missing keys
				Object.keys(previousObj).forEach((key) => {
					if (!cur[key]) {
						cur[key] = previousObj[key];
					}
				});
				acc.push(cur);
				acc.splice(acc.length - 2, 1);
			} else {
				acc.push(cur);
			}
			return acc;
		}, []);

	return refactoredResult;
};
