import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import secureLocalStorage from 'react-secure-storage';
import { http, HttpResponse } from 'msw';

import { renderRouter, server, clickElement, fetchButton } from '../setupTests';

describe('config route tests', () => {
	it('Enter API key to land on main page', async () => {
		vi.mocked(secureLocalStorage.getItem).mockReturnValue(null);
		let { router } = renderRouter();
		// screen.debug();
		expect(router.state.location.pathname).toEqual('/config');
		let inputNode = screen.getByLabelText(/your openAI API key/i);
		expect(inputNode).toBeInTheDocument();
		await userEvent.keyboard('{Meta>}i');
		expect(inputNode).toHaveFocus();
		await userEvent.type(inputNode, import.meta.env.VITE_OPENAI_API_KEY_ALIAS);
		expect(inputNode).toHaveValue(import.meta.env.VITE_OPENAI_API_KEY_ALIAS);
		await clickElement();
		await waitFor(() => {
			expect(router.state.location.pathname).toEqual('/');
		});
	});
	it('Wrong API key format triggers error toast', async () => {
		vi.mocked(secureLocalStorage.getItem).mockReturnValue(null);
		renderRouter();
		let inputNode = screen.getByLabelText(/your openAI API key/i);
		await userEvent.type(inputNode, 'TESTING');
		await clickElement();
		let errorMessageToast = await screen.findByRole('alert');
		expect(errorMessageToast).toHaveTextContent(/Invalid API Key Format/);
	});
	it('Cancel editing API key and jump back to main page', async () => {
		let { router } = renderRouter({ initialEntries: ['/', '/config'], initialIndex: 1 });
		expect(screen.getByRole('heading')).toHaveTextContent(/default/i);
		await clickElement(/edit/i);
		expect(screen.getByLabelText(/your openAI API key/i)).toBeInTheDocument();
		await clickElement(/cancel/i);
		expect(router.state.location.pathname).toEqual('/');
		// reenter config page always shows existing API key and edit button.
		await clickElement(/config/i);
		expect(fetchButton(/edit/i)).toBeInTheDocument();
	});
	it('Input custom API key', async () => {
		let { router } = renderRouter({ initialEntries: ['/', '/config'], initialIndex: 1 });
		await clickElement(/edit/i);
		let apiKeyInput = screen.getByLabelText(/your openAI API key/i);
		expect(apiKeyInput).toBeInTheDocument();
		await userEvent.type(apiKeyInput, import.meta.env.VITE_OPENAI_API_KEY);
		await clickElement(/done/i);
		await waitFor(() => {
			expect(router.state.location.pathname).toEqual('/');
		});
		await clickElement(/config/i);
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
	});
	it('In the case of server error, show error message in the toast', async () => {
		server.use(
			http.post('/.netlify/functions/testAPI', async () => {
				return new HttpResponse(null, { status: 500 });
			})
		);
		vi.mocked(secureLocalStorage.getItem).mockReturnValue(null);
		renderRouter();
		await userEvent.type(screen.getByLabelText(/your openAI API key/i), import.meta.env.VITE_OPENAI_API_KEY_ALIAS);
		await clickElement();
		expect(await screen.findByRole('alert')).toBeInTheDocument();
	});
});
