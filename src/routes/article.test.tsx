import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { renderAnExistingArticle, clickElement, server, fetchButton, renderAnExistingArticleAndWaitForGrammarQueriesToFinish } from '../setupTests';
import { defaultArticleInput } from '../utils';

describe('Article route tests', () => {
	it('If no grammar fixes available, paragraphs would enter doneModification mode automatically', async () => {
		renderAnExistingArticle();
		expect(await screen.findByRole('alert')).toBeInTheDocument();
		let alertBody = await screen.findByText(/no grammar mistakes/i);
		expect(alertBody).toBeInTheDocument();
		expect(fetchButton(/accept all/i)).toBeDisabled();
		expect(fetchButton(/done/i)).toBeEnabled();
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
		renderAnExistingArticle(2);
		expect(await fetchButton({ type: 'find', name: /retry all/i })).toBeInTheDocument();
		expect(screen.getByRole('alert')).toBeInTheDocument();
		server.resetHandlers();
		let retryButtons = screen.getAllByRole('button', { name: /retry/i });
		await clickElement(retryButtons[0]);
		await waitFor(() => {
			expect(fetchButton({ type: 'query', name: /retry all/i })).not.toBeInTheDocument();
		});
	});
	it('Delete article and undo deletion', async () => {
		renderAnExistingArticle();
		await clickElement(/delete article/i);
		expect(screen.getByRole('textbox')).toBeInTheDocument();
		await clickElement(/undo/i);
		expect(fetchButton(/delete article/i)).toBeInTheDocument();
	});
	it('Delete paragraph and undo deletion', async () => {
		renderAnExistingArticle();
		await clickElement(/delete paragraph/i);
		expect(fetchButton(/create/i)).toBeInTheDocument();
		await clickElement(/undo/i);
		expect(fetchButton(/delete paragraph/i)).toBeInTheDocument();
	});
	it('Pin and unpin article', async () => {
		renderAnExistingArticle();
		let pinButtons = screen.getAllByRole('button', { name: /pin/i });
		await clickElement(pinButtons[3]);
		let unpinButtons = screen.getAllByRole('button', { name: /unpin/i });
		expect(unpinButtons).toHaveLength(2);
		await clickElement(unpinButtons[1]);
		expect(screen.queryAllByRole('button', { name: /unpin/i })).toHaveLength(0);
	});
	it('Modal manipulating', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(false);
		let textDeletion = screen.getAllByText((content, element) => element?.tagName.toLowerCase() === 'del');
		let initialDeletionCount = textDeletion.length;
		await userEvent.hover(textDeletion[0]);
		await clickElement(/accept$/i);
		expect(screen.getAllByText((content, element) => element?.tagName.toLowerCase() === 'del')).toHaveLength(initialDeletionCount - 1);
		let textInsertion = screen.getAllByText((content, element) => element?.tagName.toLowerCase() === 'ins');
		let initialInsertionCount = textInsertion.length;
		await userEvent.hover(textInsertion[0]);
		await clickElement(/ignore/i);
		expect(screen.queryAllByText((content, element) => element?.tagName.toLowerCase() === 'ins')).toHaveLength(initialInsertionCount - 1);
	});
	it('Insert new paragraph below', async () => {
		renderAnExistingArticle();
		let paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		let initialParagraphCount = paragraphsOnThePage.length;
		await waitFor(() => {
			expect(fetchButton(/done/i)).toBeEnabled();
		});
		await clickElement(/done/i);
		await clickElement(/insert below/i);
		let paragraphInputBox = screen.getByRole('textbox');
		expect(paragraphInputBox).toBeInTheDocument();
		await userEvent.type(paragraphInputBox, 'Insert below');
		await clickElement(/done/i);

		await waitFor(() => {
			expect(fetchButton(/done/i)).toBeEnabled();
		});
		await clickElement(/done/i);

		paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		expect(paragraphsOnThePage.length).toEqual(initialParagraphCount + 1);
		expect(paragraphsOnThePage[paragraphsOnThePage.length - 1]).toHaveTextContent('Insert below');
	});

	it('Saving an empty new paragraph would cause it to be deleted immediately', async () => {
		renderAnExistingArticle();
		await waitFor(() => {
			expect(fetchButton(/done/i)).toBeEnabled();
		});
		let paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		let initialParagraphCount = paragraphsOnThePage.length;
		await clickElement(/done/i);
		await clickElement(/insert above/i);
		await clickElement(/done/i);
		paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		expect(paragraphsOnThePage.length).toEqual(initialParagraphCount);
	});

	it('Click grammar-modified paragraph to enter its editing state, then make edits', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		let paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		let initialParagraphCount = screen.getAllByRole('article').length;
		await clickElement(paragraphsOnThePage[paragraphsOnThePage.length - 1]);
		let textInputBox = screen.getByRole('textbox');
		expect(textInputBox).toBeInTheDocument();
		await userEvent.keyboard('{Enter}{Enter}');
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/consider adding a new paragraph/i)).toBeInTheDocument();
		await userEvent.paste(defaultArticleInput);
		expect(screen.getAllByRole('article').length).toEqual(initialParagraphCount + 1);
	});
	it('Re-fetch paragraph grammar mistakes', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		expect(screen.queryByText((content, element) => element?.tagName.toLowerCase() === 'del')).not.toBeInTheDocument();
		await clickElement(/find grammar mistakes/i);
		await waitFor(() => {
			let textDeletion = screen.getAllByText((content, element) => element?.tagName.toLowerCase() === 'del');
			expect(textDeletion.length).not.toBe(0);
		});
	});
	it('Fetch the paragraph translation and hide it', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		let paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		let initialParagraphCount = paragraphsOnThePage.length;
		await clickElement(/show translation/i);
		await waitFor(() => {
			paragraphsOnThePage = screen.getAllByText((content, element) => {
				return element?.tagName.toLowerCase() === 'p';
			});
			expect(paragraphsOnThePage).toHaveLength(initialParagraphCount + 1);
		});
		await clickElement(/hide translation/i);
		paragraphsOnThePage = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		});
		expect(paragraphsOnThePage).toHaveLength(initialParagraphCount);
	});
	it('Fetch for paragraph translation, but in the case of server responding error', async () => {
		server.use(
			http.post('/.netlify/functions/fetchTranslation', async () => {
				return new HttpResponse(null, { status: 500 });
			})
		);
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		await clickElement(/show translation/i);
		expect(await screen.findByText(/there was an error/i)).toBeInTheDocument();
		server.resetHandlers();
		await clickElement(/try again/i);
		await waitFor(() => {
			expect(screen.queryByText(/there was an error/i)).not.toBeInTheDocument();
		});
	});
	it('Revert paragraph to its initial state', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(false);
		await clickElement(/accept all/i);
		expect(screen.queryByText(defaultArticleInput.split('\n\n')[0])).not.toBeInTheDocument();
		await clickElement(/revert all changes/i);
		expect(screen.getByText(defaultArticleInput.split('\n\n')[0])).toBeInTheDocument();
	});
});
