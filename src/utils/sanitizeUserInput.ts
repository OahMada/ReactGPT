export var sanitizeUserInput = (input: string) => {
	return input
		.trim()
		.split(/\n{2,}/)
		.join('\n\n');
};
