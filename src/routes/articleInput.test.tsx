import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import secureLocalStorage from 'react-secure-storage';

import { renderRouter, server } from '../setupTests';

describe('article input route tests', () => {
	it('Enter API key to land on main page', async () => {
		let { router } = renderRouter();
		screen.debug();
	});
});
