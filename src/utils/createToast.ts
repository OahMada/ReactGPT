import { toast, TypeOptions, Theme, ToastContent } from 'react-toastify';

interface createToastType {
	type?: TypeOptions;
	content: ToastContent;
	theme?: Theme;
	toastId?: string;
}

export var createToast = ({ type = 'default', content, theme = 'light', toastId }: createToastType) => {
	console.log('creating toast');

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
	});
};
