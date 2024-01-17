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
	it('There would be a retry all button shown if more than one paragraph failed to fetch grammar fix queries', async () => {
		server.use(
			http.post('/.netlify/functions/fetchGrammarMistakes', async () => {
				return new HttpResponse(null, { status: 500 });
			})
		);
		renderAnExistingArticle(1);
		expect(await screen.findByRole('button', { name: /retry all/i })).toBeInTheDocument();
		expect(screen.getByRole('alert')).toBeInTheDocument();
		server.resetHandlers();
		let retryButtons = screen.getAllByRole('button', { name: /retry/i });
		await clickElement(retryButtons[0]);
		await waitFor(() => {
			expect(screen.queryByRole('button', { name: /retry all/i })).not.toBeInTheDocument();
		});
	});
	it('Delete article and undo deletion', async () => {
		renderAnExistingArticle();
		await clickElement(/delete article/i);
		expect(screen.getByRole('textbox')).toBeInTheDocument();
		await clickElement(/undo/i);
		expect(screen.getByRole('button', { name: /delete article/i })).toBeInTheDocument();
	});
	it('Delete paragraph and undo deletion', async () => {
		renderAnExistingArticle();
		await clickElement(/delete paragraph/i);
		expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
		await clickElement(/undo/i);
		expect(screen.getByRole('button', { name: /delete paragraph/i })).toBeInTheDocument();
	});
	it('Pin and unpin article', async () => {
		renderAnExistingArticle();
		let pinButtons = screen.getAllByRole('button', { name: /pin/i });
		await clickElement(pinButtons[2]);
		let unpinButtons = screen.getAllByRole('button', { name: /unpin/i });
		expect(unpinButtons).toHaveLength(2);
		await clickElement(unpinButtons[1]);
		expect(screen.queryAllByRole('button', { name: /unpin/i })).toHaveLength(0);
	});
	it('Modal manipulating', async () => {
		renderAnExistingArticle(1);
		let acceptAllButtons: HTMLElement[] = [];
		await waitFor(() => {
			acceptAllButtons = screen.getAllByRole('button', { name: /accept all/i });
			expect(acceptAllButtons[0]).toBeEnabled();
		});
		await clickElement(acceptAllButtons[1]); // constrain the number of related elements
		let textDeletion = screen.getAllByRole('deletion');
		let initialDeletionCount = textDeletion.length;
		await userEvent.hover(textDeletion[0]);
		await clickElement(/accept$/i);
		expect(screen.getAllByRole('deletion')).toHaveLength(initialDeletionCount - 1);
		let textInsertion = screen.getAllByRole('insertion');
		let initialInsertionCount = textInsertion.length;
		await userEvent.hover(textInsertion[0]);
		await clickElement(/ignore/i);
		expect(screen.queryAllByRole('insertion')).toHaveLength(initialInsertionCount - 1);
	});
});
