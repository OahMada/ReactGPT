import { toast, TypeOptions, Theme, ToastContent } from 'react-toastify';

interface createToastType {
	type?: TypeOptions;
	content: ToastContent;
	theme?: Theme;
	toastId?: string;
	containerId?: string;
}

// pass toastId to avoid duplication
// pass containerId to render toast container with specific settings
export var createToast = ({ type = 'default', content, theme = 'light', toastId, containerId }: createToastType) => {
	return toast(content, {
		position: 'top-left',
		autoClose: 3000,
		// hideProgressBar: true,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		theme: theme,
		type: type,
		toastId,
		containerId,
	});
};
