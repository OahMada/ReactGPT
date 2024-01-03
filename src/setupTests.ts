/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

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
