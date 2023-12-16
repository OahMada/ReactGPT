import { generateHotkeyLabel } from '.';

export var hotkeyMap = {
	configPage: {
		edit: {
			hotkey: 'mod+e',
			label: generateHotkeyLabel('mod+e'),
		},
		cancel: {
			hotkey: 'mod+x',
			label: generateHotkeyLabel('mod+x'),
		},
		focusInput: {
			hotkey: 'mod+i',
			label: generateHotkeyLabel('mod+i'),
		},
	},
	articleInputPage: {
		done: {
			hotkey: 'mod+enter',
			label: generateHotkeyLabel('mod+enter'),
		},
	},
	articlePage: {
		enterConfig: { hotkey: 'mod+/', label: generateHotkeyLabel('mod+/') },
		enableSearch: { hotkey: 'mod+k', label: generateHotkeyLabel('mod+k') },
		createNewArticle: { hotkey: 'mod+e', label: generateHotkeyLabel('mod+e') },
		pinArticle: { hotkey: 'shift+s', label: generateHotkeyLabel('shift+s') },
		deleteArticle: { hotkey: 'shift+d', label: generateHotkeyLabel('shift+d') },
		previewArticle: { hotkey: 'shift+p', label: generateHotkeyLabel('shift+p') },
		retryAllErred: { hotkey: 'shift+r', label: generateHotkeyLabel('shift+r') },
		undoArticleDeletion: { hotkey: 'mod+u', label: generateHotkeyLabel('mod+u') },
		traverseDownwardsParagraphList: { hotkey: 'shift+down' },
		traverseUpwardsParagraphList: { hotkey: 'shift+up' },
		deleteParagraph: { hotkey: 'd', label: generateHotkeyLabel('d') },
		undoParagraphDeletion: { hotkey: 'u', label: generateHotkeyLabel('u') },
		insertParagraphAbove: { hotkey: '=', label: generateHotkeyLabel('=') },
		insertParagraphBelow: { hotkey: '-', label: generateHotkeyLabel('-') },
	},
	previewPage: {
		includeTranslation: { hotkey: 'mod+i', label: generateHotkeyLabel('mod+i') },
		exitPreview: { hotkey: 'mod+x', label: generateHotkeyLabel('mod+x') },
		copyToClipboard: { hotkey: 'c', label: generateHotkeyLabel('c') },
		showExportOptions: { hotkey: 'mod+e', label: generateHotkeyLabel('mod+e') },
		downloadPDF: { hotkey: 'p', label: generateHotkeyLabel('p') },
		downloadDocx: { hotkey: 'd', label: generateHotkeyLabel('d') },
		downloadImg: { hotkey: 'i', label: generateHotkeyLabel('i') },
		retryAllErred: { hotkey: 'shift+r', label: generateHotkeyLabel('shift+r') },
	},
	errorPage: {
		back: {
			hotkey: 'mod+b',
			label: generateHotkeyLabel('mod+b'),
		},
	},
};
