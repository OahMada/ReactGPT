import { diffWords } from 'diff';
import { refactoredChange } from '../types';

export var findTheDiffsBetweenTwoStrings = (strA: string, strB: string) => {
	let result = diffWords(strA, strB);
	let refactoredResult = result
		// combine white spaces between the additions
		// .reduce<Change[]>((acc, cur) => {
		// 	if (acc.length > 1 && acc[acc.length - 1].added && cur.value === ' ') {
		// 		acc[acc.length - 1].value += cur.value;
		// 	}
		// 	acc.push(cur);
		// 	return acc;
		// }, [])
		// combine white spaces between removal
		// .reduce<Change[]>((acc, cur) => {
		// 	if (acc.length > 1 && acc[acc.length - 1].value === ' ' && cur.removed) {
		// 		cur.value = acc[acc.length - 1].value + cur.value;
		// 	}
		// 	acc.push(cur);
		// 	return acc;
		// }, [])
		// remove items whose value only contain white spaces
		// .filter((item) => !(item.value === ' ' && item.added === undefined && item.removed === undefined))
		// .filter((item) => item.value !== ' ')
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
			if (acc.length > 1 && (previousObj?.added || previousObj?.removed) && (cur.added || cur.removed)) {
				// concat same string keys
				Object.keys(cur).forEach((key) => {
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
