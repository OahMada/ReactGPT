import { useHotkeys, HotkeyCallback, Options } from 'react-hotkeys-hook';

interface useKeysProps extends Partial<Options> {
	keyBinding: string;
	callback: HotkeyCallback;
}

export var useKeys = ({ keyBinding, callback, enabled, scopes }: useKeysProps) => {
	useHotkeys(keyBinding, callback, { preventDefault: true, enableOnFormTags: ['input', 'select', 'textarea'], enabled, scopes });
};
