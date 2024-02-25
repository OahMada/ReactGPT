import { decompress } from 'lz-string';
import { generateHotkeyLabel } from '.';
import { LocalStorageHotkeys } from '../types';

export var HotkeyMapData = () => {
	let userDefinedHotkeys: LocalStorageHotkeys;
	let localStorageData = localStorage.getItem('userDefinedHotkeys');
	if (localStorageData) {
		userDefinedHotkeys = JSON.parse(decompress(localStorageData));
	}

	let getUserDefinedHotkey = ({ id, hotkey: defaultHotkey }: { id: string; hotkey: string }) => {
		return userDefinedHotkeys && userDefinedHotkeys[id] ? userDefinedHotkeys[id] : defaultHotkey;
	};

	return {
		'Config Page': {
			edit: {
				id: 'config/edit',
				hotkey: getUserDefinedHotkey({ id: 'config/edit', hotkey: 'mod+e' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'config/edit', hotkey: 'mod+e' })),
				purpose: 'Click the Edit button.',
			},
			cancel: {
				id: 'config/cancel',
				hotkey: getUserDefinedHotkey({ id: 'config/cancel', hotkey: 'mod+x' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'config/cancel', hotkey: 'mod+x' })),
				purpose: 'Click the Cancel button.',
			},
			focusInput: {
				id: 'config/focusInput',
				hotkey: getUserDefinedHotkey({ id: 'config/focusInput', hotkey: 'mod+i' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'config/focusInput', hotkey: 'mod+i' })),
				purpose: 'Focus the API key input field.',
			},
		},
		'Article Input Page': {
			done: {
				id: 'articleInput/done',
				hotkey: getUserDefinedHotkey({ id: 'articleInput/done', hotkey: 'mod+enter' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'articleInput/done', hotkey: 'mod+enter' })),
				purpose: 'Click the Done edit button.',
			},
		},
		'Article Page': {
			enterConfig: {
				id: 'article/config',
				hotkey: getUserDefinedHotkey({ id: 'article/config', hotkey: 'mod+/' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/config', hotkey: 'mod+/' })),
				purpose: 'Enter the Config page.',
			},
			enterHotkeyMap: {
				id: 'article/hotkeyMap',
				hotkey: getUserDefinedHotkey({ id: 'article/hotkeyMap', hotkey: 'mod+m' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/hotkeyMap', hotkey: 'mod+m' })),
				purpose: 'Enter the Hotkey Map page.',
			},
			enableSearch: {
				id: 'article/search',
				hotkey: getUserDefinedHotkey({ id: 'article/search', hotkey: 'mod+k' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/search', hotkey: 'mod+k' })),
				purpose: 'Focus the article search input field.',
			},
			createNewArticle: {
				id: 'article/createNew',
				hotkey: getUserDefinedHotkey({ id: 'article/createNew', hotkey: 'mod+e' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/createNew', hotkey: 'mod+e' })),
				purpose: 'Create new article.',
			},
			pinArticle: {
				id: 'article/pin',
				hotkey: getUserDefinedHotkey({ id: 'article/pin', hotkey: 'shift+s' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/pin', hotkey: 'shift+s' })),
				purpose: 'Pin article.',
			},
			deleteArticle: {
				id: 'article/deleteArticle',
				hotkey: getUserDefinedHotkey({ id: 'article/deleteArticle', hotkey: 'shift+d' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/deleteArticle', hotkey: 'shift+d' })),
				purpose: 'Delete article.',
			},
			previewArticle: {
				id: 'article/preview',
				hotkey: getUserDefinedHotkey({ id: 'article/preview', hotkey: 'shift+p' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/preview', hotkey: 'shift+p' })),
				purpose: 'Preview article.',
			},
			retryAllErred: {
				id: 'article/retryAll',
				hotkey: getUserDefinedHotkey({ id: 'article/retryAll', hotkey: 'shift+r' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/retryAll', hotkey: 'shift+r' })),
				purpose: 'Click the Retry All button. Retry all erred grammar fix queries.',
			},
			undoArticleDeletion: {
				id: 'article/undoArticleDeletion',
				hotkey: getUserDefinedHotkey({ id: 'article/undoArticleDeletion', hotkey: 'mod+u' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/undoArticleDeletion', hotkey: 'mod+u' })),
				purpose: 'Click the Undo button. Undo article deletion.',
			},
			traverseDownwardsParagraphList: {
				id: 'article/traverseDown',
				hotkey: getUserDefinedHotkey({ id: 'article/traverseDown', hotkey: 'shift+down' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/traverseDown', hotkey: 'shift+down' })),
				purpose: 'Traverse downwards through the list of paragraphs.',
			},
			traverseUpwardsParagraphList: {
				id: 'article/traverseUp',
				hotkey: getUserDefinedHotkey({ id: 'article/traverseUp', hotkey: 'shift+up' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/traverseUp', hotkey: 'shift+up' })),
				purpose: 'Traverse upwards through the list of paragraphs.',
			},
			deleteParagraph: {
				id: 'article/deleteParagraph',
				hotkey: getUserDefinedHotkey({ id: 'article/deleteParagraph', hotkey: 'd' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/deleteParagraph', hotkey: 'd' })),
				purpose: 'Click the Delete Paragraph button. Delete focused paragraph.',
			},
			undoParagraphDeletion: {
				id: 'article/undoArticleDeletion',
				hotkey: getUserDefinedHotkey({ id: 'article/undoArticleDeletion', hotkey: 'u' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/undoArticleDeletion', hotkey: 'u' })),
				purpose: 'Click the Undo button. Undo focused paragraph deletion',
			},
			insertParagraphAbove: {
				id: 'article/insertAbove',
				hotkey: getUserDefinedHotkey({ id: 'article/insertAbove', hotkey: 'equal' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/insertAbove', hotkey: '=' })),
				purpose: 'Click the Insert Above button. Insert new paragraph above current one.',
			},
			insertParagraphBelow: {
				id: 'article/insertBelow',
				hotkey: getUserDefinedHotkey({ id: 'article/insertBelow', hotkey: 'minus' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'article/insertBelow', hotkey: '-' })),
				purpose: 'Click the Insert Below button. Insert new paragraph below current one.',
			},
		},
		'Preview Page': {
			includeTranslation: {
				id: 'preview/translation',
				hotkey: getUserDefinedHotkey({ id: 'preview/translation', hotkey: 'mod+i' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/translation', hotkey: 'mod+i' })),
				purpose: 'Click the Include Translation button. Include translation into article preview.',
			},
			exitPreview: {
				id: 'preview/exit',
				hotkey: getUserDefinedHotkey({ id: 'preview/exit', hotkey: 'mod+x' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/exit', hotkey: 'mod+x' })),
				purpose: 'Click the Close button. Exit the Preview page.',
			},
			copyToClipboard: {
				id: 'preview/clipboard',
				hotkey: getUserDefinedHotkey({ id: 'preview/clipboard', hotkey: 'c' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/clipboard', hotkey: 'c' })),
				purpose: 'Click the Copy to Clipboard button. Copy article to clipboard.',
			},
			downloadPDF: {
				id: 'preview/pdf',
				hotkey: getUserDefinedHotkey({ id: 'preview/pdf', hotkey: 'p' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/pdf', hotkey: 'p' })),
				purpose: 'Click the Download PDF button. Download article PDF file.',
			},
			downloadDocx: {
				id: 'preview/docx',
				hotkey: getUserDefinedHotkey({ id: 'preview/docx', hotkey: 'd' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/docx', hotkey: 'd' })),
				purpose: 'Click the Download DOCX button. Download article DOCX file.',
			},
			downloadImg: {
				id: 'preview/img',
				hotkey: getUserDefinedHotkey({ id: 'preview/img', hotkey: 'i' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/img', hotkey: 'i' })),
				purpose: 'Click the Download Image button. Download article as image.',
			},
			retryAllErred: {
				id: 'preview/retryAll',
				hotkey: getUserDefinedHotkey({ id: 'preview/retryAll', hotkey: 'shift+r' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'preview/retryAll', hotkey: 'shift+r' })),
				purpose: 'Click the Retry All button. Retry all erred translation queries.',
			},
		},
		'Error Page': {
			back: {
				id: 'error/back',
				hotkey: getUserDefinedHotkey({ id: 'error/back', hotkey: 'mod+b' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'error/back', hotkey: 'mod+b' })),
				purpose: 'Click the Back button. Back to main page.',
			},
		},
		'Hotkey Map Page': {
			exit: {
				id: 'hotkey/exit',
				hotkey: getUserDefinedHotkey({ id: 'hotkey/exit', hotkey: 'mod+x' }),
				label: generateHotkeyLabel(getUserDefinedHotkey({ id: 'hotkey/exit', hotkey: 'mod+x' })),
				purpose: 'Click the Exit button. Back to previous page.',
			},
		},
	};
};
