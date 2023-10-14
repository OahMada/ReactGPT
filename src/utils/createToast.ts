import { toast, TypeOptions, Theme, ToastContent, ToastOptions } from 'react-toastify';

interface createToastType {
	type?: TypeOptions;
	content: ToastContent;
	theme?: Theme;
	toastId?: string;
	containerId?: string;
	options?: Partial<ToastOptions>;
}

// pass toastId to avoid duplication
// pass containerId to render toast container with specific settings
export var createToast = ({ type = 'default', content, theme = 'light', toastId, containerId, options }: createToastType) => {
	return toast(
		content,
		Object.assign(
			{
				position: 'top-left',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: theme,
				type: type,
				toastId,
				containerId,
			},
			options
		)
	);
};
