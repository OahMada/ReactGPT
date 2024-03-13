/* eslint-disable no-unused-vars */
/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

import { setupServer } from 'msw/node';
import { render, RenderOptions, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { RouterProvider, createMemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { handlers } from './handlers';
import { setupStore, RootState, AppStore } from './redux/store';
import routesConfig from './routesConfig';
import { saveArticleInput } from './features/articleSlice';
import { defaultArticleInput } from './utils';
import { FocusedParagraphIndexContextWrapper } from './components';

// mocks
vi.mock('react-secure-storage', () => ({
	default: {
		getItem: vi.fn(() => import.meta.env.VITE_OPENAI_API_KEY_ALIAS),
		setItem: vi.fn(),
	},
}));

vi.mock('focus-trap', () => ({
	createFocusTrap: () => ({
		activate: vi.fn(),
		deactivate: vi.fn(),
	}),
}));

vi.mock('./worker/workerInstance.ts', () => ({
	workerInstance: {
		exportFile: vi.fn(),
	},
}));

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
	ui: React.ReactElement,
	{
		preloadedState = {},
		store = setupStore(preloadedState),
		// Automatically create a store instance if no store was passed in
		...renderOptions
	}: ExtendedRenderOptions = {}
) => {
	// for mocking the navigator.clipboard.writeText https://testing-library.com/docs/user-event/setup/#starting-a-session-per-setup
	userEvent.setup();
	let queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
	var Wrapper = ({ children }: { children: React.ReactNode }) => {
		return (
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<HotkeysProvider>
						<FocusedParagraphIndexContextWrapper>{children}</FocusedParagraphIndexContextWrapper>
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
beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true }); // https://github.com/testing-library/dom-testing-library/issues/987#issuecomment-1266266801
});
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

// custom extractions

type button = RegExp | string | undefined | HTMLElement;
export var clickElement = async (button?: button) => {
	if (button instanceof RegExp || typeof button === 'string' || !button) {
		await userEvent.click(screen.getByRole('button', { name: button }));
	} else {
		await userEvent.click(button);
	}
};

// https://redux.js.org/usage/writing-tests#preparing-initial-test-state
export var renderAnExistingArticle = (articleIndex: number = 0, enterPreview: boolean = false) => {
	let articleArr = [
		['article1', 'Hello there.'],
		['article2', defaultArticleInput.split('\n\n')[0]],
		['article3', defaultArticleInput],
	];
	let store = setupStore();
	store.dispatch(saveArticleInput({ articleText: articleArr[0][1], articleId: articleArr[0][0] }));
	store.dispatch(saveArticleInput({ articleText: articleArr[1][1], articleId: articleArr[1][0] }));
	store.dispatch(saveArticleInput({ articleText: articleArr[2][1], articleId: articleArr[2][0] }));

	if (enterPreview) {
		return renderRouter({ store, initialEntries: [`/article/${articleArr[articleIndex][0]}/preview`] });
	}
	return renderRouter({ store, initialEntries: [`/article/${articleArr[articleIndex][0]}`] });
};

interface fetchButtonType {
	type?: 'find' | 'query' | 'get';
	name: string | RegExp;
}
type btnName = string | RegExp;

export function fetchButton(args: fetchButtonType): HTMLElement | null | Promise<HTMLElement>;
export function fetchButton(btnName: btnName): HTMLElement;
export function fetchButton(arg: fetchButtonType | btnName) {
	let button;
	if (typeof arg === 'string' || arg instanceof RegExp) {
		button = screen.getByRole('button', { name: arg });
	} else {
		let { type, name } = arg;
		if (!type) {
			type = 'get';
		}
		button = screen[`${type}ByRole`]('button', { name });
	}
	return button;
}

export async function renderAnExistingArticleAndWaitForGrammarQueriesToFinish(clickDoneButton: boolean = true) {
	renderAnExistingArticle(1);
	await waitFor(() => {
		expect(fetchButton(/done/i)).toBeEnabled();
	});
	if (!clickDoneButton) {
		return;
	}
	await clickElement(/done/i);
}

interface fetchElementsByTagNameType {
	tagName: string;
	method: 'get' | 'find' | 'query';
}

export async function fetchElementsByTagName(fetchOptions: fetchElementsByTagNameType): Promise<HTMLElement | null>;
export async function fetchElementsByTagName(tagName: string): Promise<HTMLElement[]>;
export async function fetchElementsByTagName(arg: string | fetchElementsByTagNameType) {
	if (typeof arg === 'string') {
		return screen.getAllByText((content, element) => element?.tagName.toLowerCase() === arg);
	} else {
		let { tagName, method } = arg;
		return await screen[`${method}ByText`]((content, element) => element?.tagName.toLowerCase() === tagName);
	}
}

export async function hoverParagraphMenu() {
	let paragraphMenu = screen.getByText((content, element) => /paragraph-menu/.test(element!.className));
	await userEvent.hover(paragraphMenu);
}
