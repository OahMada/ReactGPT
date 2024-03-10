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
							<App />
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
 * css rules organize
 * icon
 * responsive layout on mobile devices
 *
 * ## bugs
 *
 * why position change when editing paragraph
 * dismissed paragraph deletion toast reappears
 * tooltip persisting issue on phone
 * sanitize user input first before checking characters length
 * retry all translation may not shown: can't reproduce
 * downloaded image ratio failure
 * tooltip stacking order in heading, preview
 * the tooltip position of preview article if a bit off
 * white header background when previewing article
 *
 * ## test
 *
 * ##  others
 *
 * update user flow
 *
 * Why do I need to input the API key every once in a while?
 * verify the persisted data
 * one thing not right with react query: error boundary reset;
 *
 */
