// react
import React from 'react';
import ReactDOM from 'react-dom/client';

// redux
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';

// redux persist
import { PersistGate } from 'redux-persist/integration/react';

// react router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// react query and persister
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// data compressing
import { compress, decompress } from 'lz-string';

// toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

// components
import { Root, Article, ArticleInput, Config, ErrorPage } from './routes';

import './index.css';

var queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			retry: false, // otherwise too much waiting
			gcTime: Infinity,
		},
	},
});

var persister = createSyncStoragePersister({
	storage: window.localStorage,
	serialize: (data) => compress(JSON.stringify(data)),
	deserialize: (data) => JSON.parse(decompress(data)),
	retry: removeOldestQuery,
});

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

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: Infinity, buster: '' }}>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<RouterProvider router={router} />
					<ToastContainer enableMultiContainer containerId={'paragraphDeletion'} closeOnClick={false} closeButton={false} />
					<ToastContainer limit={3} enableMultiContainer />
				</PersistGate>
			</Provider>
			<ReactQueryDevtools initialIsOpen={true} position='right' />
		</PersistQueryClientProvider>
	</React.StrictMode>
);

/**
 * cancel external api request in Netlify serverless function
 * article deletion bug
 * fix drag and drop and paragraph inserting
 * delete article and navigate away
 * is the persisted data right when I delete article?
 *
 * ## features
 * article creation date
 *
 * preview result
 *
 * export as pdf doc etc, send to mail
 *
 * react-hotkeys
 *
 * ## test
 * test
 *
 * ## outlook and other
 * update user flow
 *
 * rethought html layout and css
 * modal dynamic position props
 * MUI
 */
