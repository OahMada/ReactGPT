export var sanitizeUserInput = (input: string) => {
	return input
		.trim()
		.replace(/ {2,}/g, ' ') // handle multiple white spaces between words
		.split(/\n{2,}/)
		.join('\n\n');
};
