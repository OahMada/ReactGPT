import { useHotkeys, HotkeyCallback } from 'react-hotkeys-hook';

interface useKeysProps {
	keyBinding: string;
	callback: HotkeyCallback;
	enabled?: boolean;
}

export var useKeys = ({ keyBinding, callback, enabled }: useKeysProps) => {
	useHotkeys(keyBinding, callback, { preventDefault: true, enableOnFormTags: ['input', 'select', 'textarea'], enabled });
};
