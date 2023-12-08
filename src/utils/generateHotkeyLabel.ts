export var generateHotkeyLabel = (hotkeyCharacter: string, modifyKey: string | false = 'mod') => {
	let macKeyName = '',
		winKeyName = '';
	switch (modifyKey) {
		case 'mod':
			macKeyName = 'Cmd';
			winKeyName = 'Ctr';
			break;
		case 'alt':
			macKeyName = 'Opt';
			winKeyName = 'Alt';
			break;
		case 'ctrl':
			winKeyName = macKeyName = 'Ctr';
			break;
		case 'shift':
			winKeyName = macKeyName = 'Shift';
			break;
	}

	if (!modifyKey) {
		return hotkeyCharacter.toUpperCase();
	}
	return navigator.userAgentData?.platform === 'Windows'
		? `${winKeyName} + ${hotkeyCharacter.charAt(0).toUpperCase() + hotkeyCharacter.slice(1)}`
		: `${macKeyName} + ${hotkeyCharacter.charAt(0).toUpperCase() + hotkeyCharacter.slice(1)}`;
};
