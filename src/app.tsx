// react router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

// tooltip
import { Tooltip } from 'react-tooltip';

// components
import { Root, Article, ArticleInput, Config, ErrorPage, Preview } from './routes';

var router = createBrowserRouter([
	{
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Root />,
				children: [
					{
						errorElement: <ErrorPage />,
						children: [
							{ index: true, element: <ArticleInput /> },
							{
								path: 'article/:articleId',
								element: <Article />,
								children: [
									{
										path: 'preview',
										element: <Preview />,
									},
								],
							},
						],
					},
				],
			},
			{
				path: 'config',
				element: <Config />,
			},
		],
	},
]);

export var App = () => {
	return (
		<>
			<RouterProvider router={router} />
			<ToastContainer enableMultiContainer containerId={'articleDeletion'} closeOnClick={false} closeButton={false} />
			<ToastContainer limit={3} enableMultiContainer />
			<Tooltip id='hotkey' delayShow={1000} role='tooltip' style={{ zIndex: 999 }} />
		</>
	);
};
