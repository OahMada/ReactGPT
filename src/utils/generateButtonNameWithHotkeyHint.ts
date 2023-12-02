export var generateButtonName = (rawButtonName: string, hotkeyCharacter: string) => {
	return `${rawButtonName} (${navigator.userAgentData?.platform === 'Windows' ? `Ctr + ${hotkeyCharacter}` : `Cmd + ${hotkeyCharacter}`})`;
};
