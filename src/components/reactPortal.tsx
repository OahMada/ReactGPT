import { createPortal } from 'react-dom';

export var ReactPortal = ({ children }: { children: React.ReactNode }) => {
	let previewWrapper = document.querySelector('#preview-wrapper');
	if (!previewWrapper) {
		previewWrapper = document.createElement('div');
		previewWrapper.setAttribute('id', 'preview-wrapper');
		document.querySelector('#root')!.appendChild(previewWrapper);
	}
	return createPortal(children, previewWrapper);
};
