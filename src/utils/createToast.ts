import { toast, TypeOptions, Theme } from 'react-toastify';

interface createToastType {
	type?: TypeOptions;
	message: string;
	theme?: Theme;
	toastId: string;
}

export var createToast = ({ type = 'default', message, theme = 'light', toastId }: createToastType) => {
	toast(message, {
		position: 'top-left',
		autoClose: 3000,
		hideProgressBar: true,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		theme: theme,
		type: type,
		toastId,
	});
};
