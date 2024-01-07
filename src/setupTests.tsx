/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

import { PropsWithChildren, ReactElement } from 'react';
import { setupServer } from 'msw/node';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { RouterProvider, createMemoryRouter, MemoryRouterProps } from 'react-router-dom';

import { handlers } from './handlers';
import { setupStore, RootState, AppStore } from './redux/store';
import { routesConfig } from './routesConfig';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	preloadedState?: Partial<RootState>;
	store?: AppStore;
}

// https://reactrouter.com/en/main/routers/create-memory-router
var renderWithContexts = (
	ui: ReactElement,
	{
		preloadedState = {},
		store = setupStore(preloadedState),
		// Automatically create a store instance if no store was passed in
		...renderOptions
	}: ExtendedRenderOptions = {}
) => {
	let queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
	var Wrapper = ({ children }: PropsWithChildren<{}>): JSX.Element => {
		return (
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<HotkeysProvider>
						{children}
						<ToastContainer />
						<Tooltip />
					</HotkeysProvider>
				</Provider>
			</QueryClientProvider>
		);
	};
	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// https://reactrouter.com/en/main/routers/create-memory-router
export var renderRouter = ({ initialEntries = ['/'], initialIndex = 0 }: Partial<MemoryRouterProps> = {}) => {
	let router = createMemoryRouter(routesConfig, {
		initialEntries,
		initialIndex,
	});
	return { router, ...renderWithContexts(<RouterProvider router={router} />) };
};

// msw server
export var server = setupServer(...handlers);

// https://mswjs.io/docs/integrations/node#confirmation
server.events.on('request:start', ({ request }) => {
	console.log('MSW intercepted:', request.method, request.url);
});

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());