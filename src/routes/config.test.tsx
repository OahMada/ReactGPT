import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import secureLocalStorage from 'react-secure-storage';

import { renderRouter, server } from '../setupTests';

describe('config route tests', () => {
	it('Enter API key to land on main page', async () => {
		vi.mocked(secureLocalStorage.getItem).mockReturnValue(null);
		let { router } = renderRouter();
		// screen.debug();
		expect(router.state.location.pathname).toEqual('/config');
		let inputNode = screen.getByLabelText(/input your openAI API key/i);
		expect(inputNode).toBeInTheDocument();
		await userEvent.keyboard('{Meta>}i');
		expect(inputNode).toHaveFocus();
		await userEvent.type(inputNode, import.meta.env.VITE_OPENAI_API_KEY_ALIAS);
		expect(inputNode).toHaveValue(import.meta.env.VITE_OPENAI_API_KEY_ALIAS);
		await userEvent.click(screen.getByRole('button'));
		expect(router.state.location.pathname).toEqual('/');
	});
});
