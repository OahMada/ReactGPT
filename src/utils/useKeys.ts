import { useHotkeys, HotkeyCallback } from 'react-hotkeys-hook';

interface useKeysProps {
	keyBinding: string;
	callback: HotkeyCallback;
	enabled?: boolean;
	scopes?: string;
}

export var useKeys = ({ keyBinding, callback, enabled, scopes }: useKeysProps) => {
	useHotkeys(keyBinding, callback, { preventDefault: true, enableOnFormTags: ['input', 'select', 'textarea'], enabled, scopes });
};
