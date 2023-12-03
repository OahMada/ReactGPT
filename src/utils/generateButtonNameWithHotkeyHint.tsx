export var generateButtonName = (rawButtonName: string, hotkeyCharacter: string) => {
	return (
		<>
			{rawButtonName + ' ('}
			{navigator.userAgentData?.platform === 'Windows' ? (
				<>
					<kbd>Ctr</kbd> <kbd>{hotkeyCharacter.toUpperCase()}</kbd>
				</>
			) : (
				<>
					<kbd>Cmd</kbd> <kbd>{hotkeyCharacter.toUpperCase()}</kbd>
				</>
			)}
			{')'}
		</>
	);
};

export var generateStringButtonName = (rawButtonName: string, hotkeyCharacter: string) => {
	return `${rawButtonName} (${
		navigator.userAgentData?.platform === 'Windows' ? `Ctr ${hotkeyCharacter.toUpperCase()}` : `Cmd ${hotkeyCharacter.toUpperCase()}`
	})`;
};
