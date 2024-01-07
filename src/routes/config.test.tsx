import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import secureLocalStorage from 'react-secure-storage';

import { renderRouter, server } from '../setupTests';

describe('config route tests', () => {
	it('Open the main page, but the app jumps to the Config page because no API key has been provided.', () => {
		let { router } = renderRouter();
		expect(router.state.location.pathname).toEqual('/config');
	});
});
