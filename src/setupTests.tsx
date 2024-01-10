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
import { screen, ByRoleOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { handlers } from './handlers';
import { setupStore, RootState, AppStore } from './redux/store';
import { routesConfig } from './routesConfig';
import { saveArticleInput } from './features/articleSlice';
import { defaultArticleInput } from './utils';

// mocks
vi.mock('react-secure-storage', () => ({
	default: {
		getItem: vi.fn(() => import.meta.env.VITE_OPENAI_API_KEY_ALIAS),
		setItem: vi.fn(),
	},
}));
vi.mock('./worker/workerInstance.ts');

// for React tooltip library
var ResizeObserverMock = vi.fn(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

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
	var Wrapper = ({ children }: PropsWithChildren<object>): JSX.Element => {
		return (
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<HotkeysProvider>
						{children}
						<ToastContainer />
						<Tooltip id='hotkey' />
					</HotkeysProvider>
				</Provider>
			</QueryClientProvider>
		);
	};
	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

type renderRouterProps = Partial<MemoryRouterProps> & {
	store?: AppStore;
};

// https://reactrouter.com/en/main/routers/create-memory-router
export var renderRouter = ({ initialEntries = ['/'], initialIndex = 0, store }: renderRouterProps = {}) => {
	let router = createMemoryRouter(routesConfig, {
		initialEntries,
		initialIndex,
	});
	return { router, ...renderWithContexts(<RouterProvider router={router} />, { store }) };
};

// msw server
export var server = setupServer(...handlers);

// https://mswjs.io/docs/integrations/node#confirmation
// server.events.on('request:start', ({ request }) => {
// 	console.log('MSW intercepted:', request.method, request.url);
// });

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

// custom extractions
export var clickButton = async (name?: ByRoleOptions['name']) => {
	await userEvent.click(screen.getByRole('button', { name }));
};

// https://redux.js.org/usage/writing-tests#preparing-initial-test-state
export var prepareStoreForArticlePageTests = () => {
	let store = setupStore();
	store.dispatch(saveArticleInput({ articleText: defaultArticleInput, articleId: 'article1' }));
	store.dispatch(saveArticleInput({ articleText: 'Hello there.', articleId: 'article2' }));
	return store;
};
