// react
import React from 'react';
import ReactDOM from 'react-dom/client';

// redux
import { Provider } from 'react-redux';
import { persistor, store } from './app/store';
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

// components
import Root from './routes/root';
import ErrorPage from './error-page';
import Article from './routes/article';
import ArticleInput from './routes/articleInput';
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
		path: '/',
		element: <Root />,
		errorElement: <ErrorPage />,
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
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: Infinity, buster: '' }}>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<RouterProvider router={router} />
				</PersistGate>
			</Provider>
			<ReactQueryDevtools initialIsOpen={true} position='right' />
		</PersistQueryClientProvider>
	</React.StrictMode>
);

/**
 * finish tutorial/navigate to un-existed article route
 * paragraph deletion bug
 * is the persisted data right when I delete article?
 * fix drag and drop and paragraph inserting
 *
 * protected route
 * accept user input opaiAPI key and encrypt the key save to local-storage
 * a way to invoke hidden default api key
 * change api key setting
 *
 * preview result
 * export as pdf doc etc, send to mail
 *
 * react-hotkeys
 * test
 *
 * update user flow
 *
 * rethought html layout and css
 * modal dynamic position props
 * MUI
 */
