import { useHotkeys, HotkeyCallback } from 'react-hotkeys-hook';

interface useKeysProps {
	keyBinding: string;
	callback: HotkeyCallback;
}

export var useKeys = ({ keyBinding, callback }: useKeysProps) => {
	useHotkeys(keyBinding, callback, { preventDefault: true, enableOnFormTags: ['input', 'select', 'textarea'] });
};
