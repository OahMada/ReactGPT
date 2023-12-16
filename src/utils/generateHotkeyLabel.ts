export var generateHotkeyLabel = (hotkey: string) => {
	let hotkeyParts = hotkey.split('+');
	let labels = hotkeyParts.reduce<{ winLabel: string[]; macLabel: string[] }>(
		(acc, cur) => {
			let winKeyLabel = '',
				macKeyLabel = '';
			switch (cur) {
				case 'mod':
					macKeyLabel = 'Cmd';
					winKeyLabel = 'Ctr';
					break;
				case 'alt':
					macKeyLabel = 'Opt';
					winKeyLabel = 'Alt';
					break;
				case 'ctrl':
					winKeyLabel = macKeyLabel = 'Ctr';
					break;
				default:
					winKeyLabel = macKeyLabel = cur.charAt(0).toUpperCase() + cur.slice(1);
			}
			acc.winLabel.push(winKeyLabel);
			acc.macLabel.push(macKeyLabel);
			return acc;
		},
		{ winLabel: [], macLabel: [] }
	);
	return navigator.userAgentData?.platform === 'Windows' ? labels.winLabel.join(' + ') : labels.macLabel.join(' + ');
};
