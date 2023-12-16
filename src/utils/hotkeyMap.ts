import { generateHotkeyLabel } from '.';

export var hotkeyMap = {
	'Config Page': {
		edit: {
			hotkey: 'mod+e',
			label: generateHotkeyLabel('mod+e'),
			purpose: 'Click the Edit button.',
		},
		cancel: {
			hotkey: 'mod+x',
			label: generateHotkeyLabel('mod+x'),
			purpose: 'Click the Cancel button.',
		},
		focusInput: {
			hotkey: 'mod+i',
			label: generateHotkeyLabel('mod+i'),
			purpose: 'Focus the API key input field.',
		},
	},
	'Article Input Page': {
		done: {
			hotkey: 'mod+enter',
			label: generateHotkeyLabel('mod+enter'),
			purpose: 'Click the Done edit button.',
		},
	},
	'Article Page': {
		enterConfig: { hotkey: 'mod+/', label: generateHotkeyLabel('mod+/'), purpose: 'Enter the Config page.' },
		enterHotkeyMap: { hotkey: 'mod+m', label: generateHotkeyLabel('mod+m'), purpose: 'Enter the Hotkey Map page.' },
		enableSearch: {
			hotkey: 'mod+k',
			label: generateHotkeyLabel('mod+k'),
			purpose: 'Focus the article search input field.',
		},
		createNewArticle: {
			hotkey: 'mod+e',
			label: generateHotkeyLabel('mod+e'),
			purpose: 'Create new article.',
		},
		pinArticle: {
			hotkey: 'shift+s',
			label: generateHotkeyLabel('shift+s'),
			purpose: 'Pin article.',
		},
		deleteArticle: {
			hotkey: 'shift+d',
			label: generateHotkeyLabel('shift+d'),
			purpose: 'Delete article.',
		},
		previewArticle: {
			hotkey: 'shift+p',
			label: generateHotkeyLabel('shift+p'),
			purpose: 'Preview article.',
		},
		retryAllErred: {
			hotkey: 'shift+r',
			label: generateHotkeyLabel('shift+r'),
			purpose: 'Click the Retry All button. Retry all erred grammar fix queries.',
		},
		undoArticleDeletion: {
			hotkey: 'mod+u',
			label: generateHotkeyLabel('mod+u'),
			purpose: 'Click the Undo button. Undo article deletion.',
		},
		traverseDownwardsParagraphList: {
			hotkey: 'shift+down',
			label: generateHotkeyLabel('shift+down'),
			purpose: 'Traverse downwards through the list of paragraphs.',
		},
		traverseUpwardsParagraphList: {
			hotkey: 'shift+up',
			label: generateHotkeyLabel('shift+up'),
			purpose: 'Traverse upwards through the list of paragraphs.',
		},
		deleteParagraph: {
			hotkey: 'd',
			label: generateHotkeyLabel('d'),
			purpose: 'Click the Delete Paragraph button. Delete focused paragraph.',
		},
		undoParagraphDeletion: {
			hotkey: 'u',
			label: generateHotkeyLabel('u'),
			purpose: 'Click the Undo button. Undo focused paragraph deletion',
		},
		insertParagraphAbove: {
			hotkey: '=',
			label: generateHotkeyLabel('='),
			purpose: 'Click the Insert Above button. Insert new paragraph above current one.',
		},
		insertParagraphBelow: {
			hotkey: '-',
			label: generateHotkeyLabel('-'),
			purpose: 'Click the Insert Below button. Insert new paragraph below current one.',
		},
	},
	'Preview Page': {
		includeTranslation: {
			hotkey: 'mod+i',
			label: generateHotkeyLabel('mod+i'),
			purpose: 'Click the Include Translation button. Include translation into article preview.',
		},
		exitPreview: {
			hotkey: 'mod+x',
			label: generateHotkeyLabel('mod+x'),
			purpose: 'Close the Close button. Exit the Preview page.',
		},
		copyToClipboard: {
			hotkey: 'c',
			label: generateHotkeyLabel('c'),
			purpose: 'Click the Copy to Clipboard button. Copy article to clipboard.',
		},
		showExportOptions: {
			hotkey: 'mod+e',
			label: generateHotkeyLabel('mod+e'),
			purpose: 'Click the Export As File button. Show article export options.',
		},
		downloadPDF: {
			hotkey: 'p',
			label: generateHotkeyLabel('p'),
			purpose: 'Click the Download PDF button. Download article PDF file.',
		},
		downloadDocx: {
			hotkey: 'd',
			label: generateHotkeyLabel('d'),
			purpose: 'Click the Download DOCX button. Download article DOCX file.',
		},
		downloadImg: {
			hotkey: 'i',
			label: generateHotkeyLabel('i'),
			purpose: 'Click the Download Image button. Download article as image.',
		},
		retryAllErred: {
			hotkey: 'shift+r',
			label: generateHotkeyLabel('shift+r'),
			purpose: 'Click the Retry All button. Retry all erred translation queries.',
		},
	},
	'Error Page': {
		back: {
			hotkey: 'mod+b',
			label: generateHotkeyLabel('mod+b'),
			purpose: 'Click the Back button. Back to main page.',
		},
	},
	'Hotkey Map Page': {
		exit: {
			hotkey: 'mod+x',
			label: generateHotkeyLabel('mod+x'),
			purpose: 'Click the Exit button. Back to previous page.',
		},
	},
};
