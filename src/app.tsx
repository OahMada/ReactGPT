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
			<ToastContainer enableMultiContainer containerId={'articleDeletion'} closeOnClick={false} closeButton={false} />
			<ToastContainer limit={3} enableMultiContainer />
			<Tooltip id='hotkey' delayShow={1000} delayHide={150} style={{ zIndex: 300 }} />
			<Tooltip id='tip' delayShow={500} delayHide={150} style={{ zIndex: 200 }} />
		</>
	);
};
