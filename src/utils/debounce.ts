// https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940
// https://www.joshwcomeau.com/snippets/javascript/debounce/

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-unused-vars
export var debounce = <T extends (...args: any[]) => any>(callback: T, wait: number) => {
	let timeoutId = 0;
	return (...args: Parameters<T>) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			callback(...args);
		}, wait);
	};
};
