// react
import React from 'react';
import ReactDOM from 'react-dom/client';

// redux
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';

// redux persist
import { PersistGate } from 'redux-persist/integration/react';

// react query and persister
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// data compressing
import { compress, decompress } from 'lz-string';

import { App } from './app';

// style
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

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: Infinity, buster: '' }}>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<App />
				</PersistGate>
			</Provider>
			<ReactQueryDevtools initialIsOpen={true} position='right' />
		</PersistQueryClientProvider>
	</React.StrictMode>
);

/**
 * two things not right with react query: error boundary reset; resetQueries error
 *
 * ## features
 *
 * verify the persisted data
 *
 * ## bugs
 *
 * a stop recoding bug
 *
 * ## test
 * test https://testing-library.com/docs/
 *
 * ## outlook and others
 * update user flow
 *
 * rethought html layout and css
 * modal dynamic position props
 * MUI
 */
