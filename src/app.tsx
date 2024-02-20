import { createPortal } from 'react-dom';
// react router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

// tooltip
import { Tooltip } from 'react-tooltip';

import routesConfig from './routesConfig';
import GlobalStyles from './styles';

export var router = createBrowserRouter(routesConfig);

export var App = () => {
	return (
		<>
			<GlobalStyles />
			<RouterProvider router={router} />
			{/* duplicate toasts might show when applying the limit option, a library bug */}
			<ToastContainer limit={3} />
			{createPortal(
				<>
					<Tooltip id='hotkey' delayShow={1000} delayHide={150} openEvents={{ focus: false, mouseenter: true }} />
					<Tooltip id='tip' delayShow={500} delayHide={150} openEvents={{ focus: false, mouseenter: true }} />
				</>,
				document.querySelector('#root')!
			)}
		</>
	);
};
