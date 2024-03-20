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

// react hotkeys hook
import { HotkeysProvider } from 'react-hotkeys-hook';

// data compressing
import { compress, decompress } from 'lz-string';

// react icon
import { IconContext } from 'react-icons';

import { App } from './app';
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

// https://mswjs.io/docs/integrations/browser
async function enableMocking() {
	if (import.meta.env.MODE !== 'development') {
		return;
	}

	let { worker } = await import('./worker/mockExternalAPIWorker');

	// `worker.start()` returns a Promise that resolves
	// once the Service Worker is up and ready to intercept requests.
	return worker.start();
}

enableMocking().then(() => {
	ReactDOM.createRoot(document.getElementById('root')!).render(
		<React.StrictMode>
			<PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: Infinity, buster: '' }}>
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<HotkeysProvider>
							<IconContext.Provider value={{ size: '1.6rem' }}>
								<App />
							</IconContext.Provider>
						</HotkeysProvider>
					</PersistGate>
				</Provider>
				<ReactQueryDevtools initialIsOpen={true} position='right' />
			</PersistQueryClientProvider>
		</React.StrictMode>
	);
});

/**
 * ## features
 *
 * article list prevent background scroll and focus trap
 * preview add translation reset
 * use https://github.com/tuax/tua-body-scroll-lock instead
 * no grammar fixes found, click done button hide the toast
 *
 * ## bugs
 *
 * preview scroll failed: why I now need to use double finger
 * click action penetrates, add a bit delay?
 *
 * ## test
 *
 * ## others
 *
 * update user flow
 *
 * Why do I need to input the API key every once in a while?
 * verify the persisted data
 * one thing not right with react query: error boundary reset;
 *
 */
