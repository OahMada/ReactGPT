// https://stackoverflow.com/questions/70426863/how-to-make-typescript-know-my-variable-is-not-undefined-anymore

export function throwIfUndefined<T>(x: T | undefined): asserts x is T {
	if (typeof x === 'undefined') throw new Error(`Undefined value`);
}
