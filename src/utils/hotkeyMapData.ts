import { generateHotkeyLabel } from '.';

export var HotkeyMapData = () => {
	let userDefinedHotkeys = localStorage.getItem('userDefinedHotkeys');

	return {
		'Config Page': {
			edit: {
				id: 'config/edit',
				hotkey: 'mod+e',
				label: generateHotkeyLabel('mod+e'),
				purpose: 'Click the Edit button.',
			},
			cancel: {
				id: 'config/cancel',
				hotkey: 'mod+x',
				label: generateHotkeyLabel('mod+x'),
				purpose: 'Click the Cancel button.',
			},
			focusInput: {
				id: 'config/focusInput',
				hotkey: 'mod+i',
				label: generateHotkeyLabel('mod+i'),
				purpose: 'Focus the API key input field.',
			},
		},
		'Article Input Page': {
			done: {
				id: 'articleInput/done',
				hotkey: 'mod+enter',
				label: generateHotkeyLabel('mod+enter'),
				purpose: 'Click the Done edit button.',
			},
		},
		'Article Page': {
			enterConfig: { id: 'article/config', hotkey: 'mod+/', label: generateHotkeyLabel('mod+/'), purpose: 'Enter the Config page.' },
			enterHotkeyMap: { id: 'article/hotkeyMap', hotkey: 'mod+m', label: generateHotkeyLabel('mod+m'), purpose: 'Enter the Hotkey Map page.' },
			enableSearch: {
				id: 'article/search',
				hotkey: 'mod+k',
				label: generateHotkeyLabel('mod+k'),
				purpose: 'Focus the article search input field.',
			},
			createNewArticle: {
				id: 'article/createNew',
				hotkey: 'mod+e',
				label: generateHotkeyLabel('mod+e'),
				purpose: 'Create new article.',
			},
			pinArticle: {
				id: 'article/pin',
				hotkey: 'shift+s',
				label: generateHotkeyLabel('shift+s'),
				purpose: 'Pin article.',
			},
			deleteArticle: {
				id: 'article/deleteArticle',
				hotkey: 'shift+d',
				label: generateHotkeyLabel('shift+d'),
				purpose: 'Delete article.',
			},
			previewArticle: {
				id: 'article/preview',
				hotkey: 'shift+p',
				label: generateHotkeyLabel('shift+p'),
				purpose: 'Preview article.',
			},
			retryAllErred: {
				id: 'article/retryAll',
				hotkey: 'shift+r',
				label: generateHotkeyLabel('shift+r'),
				purpose: 'Click the Retry All button. Retry all erred grammar fix queries.',
			},
			undoArticleDeletion: {
				id: 'article/undoArticleDeletion',
				hotkey: 'mod+u',
				label: generateHotkeyLabel('mod+u'),
				purpose: 'Click the Undo button. Undo article deletion.',
			},
			traverseDownwardsParagraphList: {
				id: 'article/traverseDown',
				hotkey: 'shift+down',
				label: generateHotkeyLabel('shift+down'),
				purpose: 'Traverse downwards through the list of paragraphs.',
			},
			traverseUpwardsParagraphList: {
				id: 'article/traverseUp',
				hotkey: 'shift+up',
				label: generateHotkeyLabel('shift+up'),
				purpose: 'Traverse upwards through the list of paragraphs.',
			},
			deleteParagraph: {
				id: 'article/deleteParagraph',
				hotkey: 'd',
				label: generateHotkeyLabel('d'),
				purpose: 'Click the Delete Paragraph button. Delete focused paragraph.',
			},
			undoParagraphDeletion: {
				id: 'article/undoArticleDeletion',
				hotkey: 'u',
				label: generateHotkeyLabel('u'),
				purpose: 'Click the Undo button. Undo focused paragraph deletion',
			},
			insertParagraphAbove: {
				id: 'article/insertAbove',

				hotkey: '=',
				label: generateHotkeyLabel('='),
				purpose: 'Click the Insert Above button. Insert new paragraph above current one.',
			},
			insertParagraphBelow: {
				id: 'article/insertBelow',
				hotkey: '-',
				label: generateHotkeyLabel('-'),
				purpose: 'Click the Insert Below button. Insert new paragraph below current one.',
			},
		},
		'Preview Page': {
			includeTranslation: {
				id: 'preview/translation',
				hotkey: 'mod+i',
				label: generateHotkeyLabel('mod+i'),
				purpose: 'Click the Include Translation button. Include translation into article preview.',
			},
			exitPreview: {
				id: 'preview/exit',
				hotkey: 'mod+x',
				label: generateHotkeyLabel('mod+x'),
				purpose: 'Close the Close button. Exit the Preview page.',
			},
			copyToClipboard: {
				id: 'preview/clipboard',
				hotkey: 'c',
				label: generateHotkeyLabel('c'),
				purpose: 'Click the Copy to Clipboard button. Copy article to clipboard.',
			},
			showExportOptions: {
				id: 'preview/export',
				hotkey: 'mod+e',
				label: generateHotkeyLabel('mod+e'),
				purpose: 'Click the Export As File button. Show article export options.',
			},
			downloadPDF: {
				id: 'preview/pdf',
				hotkey: 'p',
				label: generateHotkeyLabel('p'),
				purpose: 'Click the Download PDF button. Download article PDF file.',
			},
			downloadDocx: {
				id: 'preview/docx',
				hotkey: 'd',
				label: generateHotkeyLabel('d'),
				purpose: 'Click the Download DOCX button. Download article DOCX file.',
			},
			downloadImg: {
				id: 'preview/img',
				hotkey: 'i',
				label: generateHotkeyLabel('i'),
				purpose: 'Click the Download Image button. Download article as image.',
			},
			retryAllErred: {
				id: 'preview/retryAll',
				hotkey: 'shift+r',
				label: generateHotkeyLabel('shift+r'),
				purpose: 'Click the Retry All button. Retry all erred translation queries.',
			},
		},
		'Error Page': {
			back: {
				id: 'error/back',
				hotkey: 'mod+b',
				label: generateHotkeyLabel('mod+b'),
				purpose: 'Click the Back button. Back to main page.',
			},
		},
		'Hotkey Map Page': {
			exit: {
				id: 'hotkey/exit',
				hotkey: 'mod+x',
				label: generateHotkeyLabel('mod+x'),
				purpose: 'Click the Exit button. Back to previous page.',
			},
		},
	};
};
