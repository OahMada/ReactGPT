export var generateHotkeyToolTipContent = (hotkeyCharacter: string, modifyKey: string | false = 'mod') => {
	let macKeyName = '',
		winKeyName = '';
	if (modifyKey === 'mod') {
		macKeyName = 'Cmd';
		winKeyName = 'Ctr';
	} else if (modifyKey === 'alt') {
		macKeyName = 'Opt';
		winKeyName = 'Alt';
	}

	if (!modifyKey) {
		return hotkeyCharacter.toUpperCase();
	}
	return navigator.userAgentData?.platform === 'Windows'
		? `${winKeyName} + ${hotkeyCharacter.toUpperCase()}`
		: `${macKeyName} + ${hotkeyCharacter.toUpperCase()}`;
};
