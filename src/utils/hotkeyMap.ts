import { generateHotkeyLabel } from '.';

export var hotkeyMap = {
	configPage: {
		edit: {
			hotkey: 'mod+e',
			label: generateHotkeyLabel('e'),
		},
		cancel: {
			hotkey: 'mod+x',
			label: generateHotkeyLabel('x'),
		},
		focusInput: {
			hotkey: 'mod+i',
			label: generateHotkeyLabel('i'),
		},
	},
	articleInputPage: {
		done: {
			hotkey: 'mod+enter',
			label: generateHotkeyLabel('enter'),
		},
	},
	articlePage: {
		enterConfig: { hotkey: 'mod+/', label: generateHotkeyLabel('/') },
		enableSearch: { hotkey: 'mod+k', label: generateHotkeyLabel('k') },
		createNewArticle: { hotkey: 'mod+e', label: generateHotkeyLabel('e') },
		pinArticle: { hotkey: 'shift+s', label: generateHotkeyLabel('s', 'shift') },
		deleteArticle: { hotkey: 'shift+d', label: generateHotkeyLabel('d', 'shift') },
		previewArticle: { hotkey: 'shift+p', label: generateHotkeyLabel('p', 'shift') },
		retryAllErred: { hotkey: 'shift+r', label: generateHotkeyLabel('r', 'shift') },
		undoArticleDeletion: { hotkey: 'mod+u', label: generateHotkeyLabel('u') },
		traverseDownwardsParagraphList: { hotkey: 'down' },
		traverseUpwardsParagraphList: { hotkey: 'up' },
		deleteParagraph: { hotkey: 'd', label: generateHotkeyLabel('d', false) },
		undoParagraphDeletion: { hotkey: 'u', label: generateHotkeyLabel('u', false) },
		insertParagraphAbove: { hotkey: '+', label: generateHotkeyLabel('+', false) },
		insertParagraphBelow: { hotkey: '-', label: generateHotkeyLabel('-', false) },
	},
	previewPage: {
		includeTranslation: { hotkey: 'mod+i', label: generateHotkeyLabel('i') },
		exitPreview: { hotkey: 'mod+x', label: generateHotkeyLabel('x') },
		copyToClipboard: { hotkey: 'c', label: generateHotkeyLabel('c', false) },
		showExportOptions: { hotkey: 'mod+e', label: generateHotkeyLabel('e') },
		downloadPDF: { hotkey: 'p', label: generateHotkeyLabel('p', false) },
		downloadDocx: { hotkey: 'd', label: generateHotkeyLabel('d', false) },
		downloadImg: { hotkey: 'i', label: generateHotkeyLabel('i', false) },
		retryAllErred: { hotkey: 'shift+r', label: generateHotkeyLabel('r', 'shift') },
	},
	errorPage: {
		back: {
			hotkey: 'mod+b',
			label: generateHotkeyLabel('b'),
		},
	},
};
