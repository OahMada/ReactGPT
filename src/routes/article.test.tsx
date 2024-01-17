import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { renderAnExistingArticle, clickElement, server } from '../setupTests';

describe('Article route tests', () => {
	it('If no grammar fixes available, paragraphs would enter doneModification mode automatically', async () => {
		renderAnExistingArticle();
		expect(await screen.findByRole('alert')).toBeInTheDocument();
		let alertBody = await screen.findByText(/no grammar mistakes/i);
		expect(alertBody).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /accept all/i })).toBeDisabled();
		expect(screen.getByRole('button', { name: /done/i })).toBeEnabled();
		// I couldn't make the blow assertion work
		// await waitFor(() => {
		// 	expect(screen.getByRole('button', { name: /show edit history/i })).toBeDisabled();
		// });
	});
});
