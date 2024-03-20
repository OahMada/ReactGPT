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
import { FocusedParagraphIndexContextWrapper } from './components';
import { isTouchDevice } from './utils';

export var router = createBrowserRouter(routesConfig);

export var App = () => {
	return (
		<>
			<GlobalStyles />
			<FocusedParagraphIndexContextWrapper>
				<RouterProvider router={router} />
			</FocusedParagraphIndexContextWrapper>

			{/* duplicate toasts might show when applying the limit option, a library bug */}
			<ToastContainer limit={3} />
			{/* hide tooltip altogether on mobile devices */}
			{!isTouchDevice() &&
				createPortal(
					<>
						<Tooltip id='hotkey' delayShow={1000} delayHide={150} style={{ zIndex: 5 }} />
						<Tooltip id='tip' delayShow={500} delayHide={150} />
					</>,
					document.querySelector('#root')!
				)}
		</>
	);
};
