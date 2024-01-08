import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderRouter, server } from '../setupTests';

describe('config route tests', () => {
	it('Open the main page, but the app jumps to the Config page because no API key has been provided.', () => {
		let { router } = renderRouter();
		expect(router.state.location.pathname).toEqual('/config'); // https://stackoverflow.com/a/73730116/5800789
	});
});
