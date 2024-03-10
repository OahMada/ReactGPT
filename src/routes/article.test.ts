import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import {
	renderAnExistingArticle,
	clickElement,
	server,
	fetchButton,
	renderAnExistingArticleAndWaitForGrammarQueriesToFinish,
	fetchElementsByTagName,
	renderRouter,
} from '../setupTests';
import { defaultArticleInput } from '../utils';
import { setupStore } from '../redux/store';
import { saveArticleInput } from '../features/articleSlice';

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
		expect(screen.getByPlaceholderText(/article content/i)).toBeInTheDocument();
		await clickElement(/undo/i);
		expect(fetchButton(/delete article/i)).toBeInTheDocument();
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
	it('Delete paragraph and undo deletion', async () => {
		renderAnExistingArticle();
		await clickElement(/delete paragraph/i);
		expect(fetchButton(/create/i)).toBeInTheDocument();
		await clickElement(/undo/i);
		expect(fetchButton(/delete paragraph/i)).toBeInTheDocument();
	});
	it('Delete paragraph and navigate to article creation', async () => {
		renderAnExistingArticle(1);
		await clickElement(/delete paragraph/i);
		expect(fetchButton(/create/i)).toBeInTheDocument();
		await clickElement(/create/i);
		expect(screen.getByPlaceholderText(/article content/i)).toBeInTheDocument();
	});
	it('Insert new paragraph below', async () => {
		renderAnExistingArticle();
		await waitFor(() => {
			expect(fetchButton(/done/i)).toBeEnabled();
		});
		await clickElement(/done/i);
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		let initialParagraphCount = paragraphsOnThePage.length;
		await clickElement(/insert below/i);
		let paragraphInputBox = screen.getByPlaceholderText(/please enter your paragraph/i);
		expect(paragraphInputBox).toBeInTheDocument();
		await userEvent.type(paragraphInputBox, 'Insert below');
		await clickElement(/done/i);
		await waitFor(() => {
			expect(fetchButton(/done/i)).toBeEnabled();
		});
		await clickElement(/done/i);

		paragraphsOnThePage = await fetchElementsByTagName('p');
		expect(paragraphsOnThePage.length).toEqual(initialParagraphCount + 1);
		expect(paragraphsOnThePage[paragraphsOnThePage.length - 2]).toHaveTextContent('Insert below');
	});
	it('Saving an empty new paragraph would cause it to be deleted immediately', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(true);
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		let initialParagraphCount = paragraphsOnThePage.length;
		await clickElement(/insert above/i);
		await clickElement(/done/i);
		paragraphsOnThePage = await fetchElementsByTagName('p');
		expect(paragraphsOnThePage.length).toEqual(initialParagraphCount);
	});
	it('Edit paragraph when error boundary is triggered', async () => {
		server.use(
			http.post('/.netlify/functions/fetchGrammarMistakes', async () => {
				return new HttpResponse(null, { status: 500 });
			})
		);
		renderAnExistingArticle(1);
		expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument();
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		await clickElement(paragraphsOnThePage[paragraphsOnThePage.length - 2]);
		await userEvent.type(screen.getByPlaceholderText(/please enter your paragraph/i), ' \n');
		await clickElement(/done/i);
		expect(screen.getByText(defaultArticleInput.split('\n\n')[0])).toBeInTheDocument();
	});
	it('Click grammar-modified paragraph to enter its editing state, then make edits', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		let initialParagraphCount = screen.getAllByRole('article').length;
		await clickElement(paragraphsOnThePage[paragraphsOnThePage.length - 2]);
		let textInputBox = screen.getByPlaceholderText(/please enter your paragraph/i);
		expect(textInputBox).toBeInTheDocument();
		await userEvent.keyboard('{Enter}{Enter}');
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/consider adding a new paragraph/i)).toBeInTheDocument();
		await userEvent.paste(defaultArticleInput);
		expect(screen.getAllByRole('article').length).toEqual(initialParagraphCount + 1);
	});
	it('Fetch the paragraph translation and hide it', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		let initialParagraphCount = paragraphsOnThePage.length;
		await clickElement(/show translation/i);
		await waitFor(async () => {
			paragraphsOnThePage = await fetchElementsByTagName('p');
			expect(paragraphsOnThePage).toHaveLength(initialParagraphCount + 1);
		});
		await clickElement(/hide translation/i);
		paragraphsOnThePage = await fetchElementsByTagName('p');
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
	it('Two different edit history viewing options', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish();
		let showEditHistoryBtn = fetchButton(/show edit history/i);
		let revertAllChangesBtn = fetchButton(/revert all changes/i);
		expect(showEditHistoryBtn).toBeDisabled();
		expect(revertAllChangesBtn).toBeDisabled();
		expect(screen.queryByText((content, element) => /deletion/.test(element!.className))).not.toBeInTheDocument();
		await clickElement(/find grammar mistakes/i);
		await waitFor(async () => {
			let textDeletion = screen.getAllByText((content, element) => /deletion/.test(element!.className));
			expect(textDeletion.length).not.toBe(0);
		});
		await clickElement(/accept all/i);
		expect(fetchButton(/show edit history/i)).toBeEnabled();
		expect(fetchButton(/revert all changes/i)).toBeEnabled();
		await clickElement(/show edit history/i);
		expect(fetchButton(/revert all/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/since paragraph creation/i)).toBeChecked();
		expect(screen.getByLabelText(/since paragraph last edit/i)).toBeDisabled();
		await clickElement(/done/i);
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		await clickElement(paragraphsOnThePage[paragraphsOnThePage.length - 2]);
		let inputBox = screen.getByPlaceholderText(/please enter your paragraph/i);
		await userEvent.type(inputBox, ' Hello.');
		await clickElement(/done/i);
		await waitFor(() => {
			expect(fetchButton(/accept all/i)).toBeEnabled();
		});
		await clickElement(/done/i);
		await clickElement(/show edit history/i);
		let sinceLastEditRadioBtn = screen.getByLabelText(/since paragraph last edit/i);
		expect(sinceLastEditRadioBtn).toBeEnabled();
		await clickElement(sinceLastEditRadioBtn);
		let textInsertionsOnThePage = screen.queryAllByText((content, element) => element?.tagName.toLowerCase() === 'ins');
		expect(textInsertionsOnThePage).toHaveLength(0);
		expect(fetchButton(/revert all/i)).toBeDisabled();
	});
	it('Trying to access a non-existing article would land on article creation page', async () => {
		let store = setupStore();
		store.dispatch(saveArticleInput({ articleText: defaultArticleInput, articleId: 'article1' }));
		renderRouter({ store, initialEntries: ['/article/article1', '/article/test'], initialIndex: 1 });
		expect(screen.getByPlaceholderText(/article content/i)).toBeInTheDocument();
	});
});

describe('Modal component tests', async () => {
	it('Modal manipulating', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(false);
		let textDeletion = screen.getAllByText((content, element) => /deletion/.test(element!.className));
		let initialDeletionCount = textDeletion.length;
		await userEvent.hover(textDeletion[0]);
		await clickElement(/accept$/i);
		expect(screen.getAllByText((content, element) => /deletion/.test(element!.className))).toHaveLength(initialDeletionCount - 1);
		let textInsertion = await fetchElementsByTagName('ins');
		let initialInsertionCount = textInsertion.length;
		await userEvent.hover(textInsertion[0]);
		await clickElement(/ignore/i);
		expect(screen.queryAllByText((content, element) => element?.tagName.toLowerCase() === 'ins')).toHaveLength(initialInsertionCount - 1);
	});
	it('Accepting all available grammar fixes will automatically convert paragraph into doneModification state', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(false);
		let textInsertionsOnThePage = await fetchElementsByTagName('ins');
		for (let index = 0; index < textInsertionsOnThePage.length; index++) {
			let ele = textInsertionsOnThePage[index];
			await userEvent.hover(ele);
			await clickElement(/accept$/i);
		}
		let textDeletionsOnThePage = screen.queryAllByText((content, element) => /deletion|replacement/.test(element!.className));
		do {
			await userEvent.hover(textDeletionsOnThePage[0]);
			await clickElement(/accept$/i);
			textDeletionsOnThePage = screen.queryAllByText((content, element) => /deletion|replacement/.test(element!.className));
		} while (textDeletionsOnThePage.length > 0);
		expect(fetchButton(/show edit history/i)).toBeInTheDocument();
	});
	it('Revert changes when viewing edit history', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(false);
		await clickElement(/accept all/i);
		await clickElement(/show edit history/i);
		let spanElementsCountOnThePage = (await fetchElementsByTagName('span')).length;
		let textInsertion = (await fetchElementsByTagName({ tagName: 'ins', method: 'get' })) as HTMLElement;
		await userEvent.hover(textInsertion);
		await clickElement(/revert$/i);
		expect(await fetchElementsByTagName('span')).toHaveLength(spanElementsCountOnThePage - 1);
		await clickElement(/revert all/i);
		expect(screen.getByText(defaultArticleInput.split('\n\n')[0])).toBeInTheDocument();
	});
	it('Un-hover a grammar fix to hide the modal', async () => {
		await renderAnExistingArticleAndWaitForGrammarQueriesToFinish(false);
		let textDeletion = screen.getAllByText((content, element) => /deletion/.test(element!.className));
		await userEvent.hover(textDeletion[0]);
		expect(fetchButton(/ignore/i)).toBeInTheDocument();
		await userEvent.unhover(textDeletion[0]);
		expect(fetchButton({ type: 'query', name: /ignore/i })).not.toBeInTheDocument();
	});
});

describe('Hotkeys and drag-and-drop', () => {
	it('Switching paragraph focus state using a hotkey: Scenario 1 - traversing down', async () => {
		renderAnExistingArticle(2);
		let articlesOnThePage = screen.getAllByRole('article');
		let deleteParagraphBtns = screen.getAllByRole('button', { name: /delete paragraph/i });
		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
		expect(articlesOnThePage[0]).toHaveFocus();
		await userEvent.hover(deleteParagraphBtns[0]);
		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toHaveTextContent('D');
		});
		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
		expect(articlesOnThePage[1]).toHaveFocus();
		await waitFor(() => {
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});
		await userEvent.hover(deleteParagraphBtns[1]);
		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toHaveTextContent('D');
		});
		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
		expect(articlesOnThePage[0]).toHaveFocus();
	});
	it('Switching paragraph focus state using a hotkey: Scenario 2 - traversing up', async () => {
		renderAnExistingArticle(2);
		let articlesOnThePage = screen.getAllByRole('article');
		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
		expect(articlesOnThePage[1]).toHaveFocus();
		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
		expect(articlesOnThePage[0]).toHaveFocus();
		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
		expect(articlesOnThePage[1]).toHaveFocus();
	});
	it('Click an article to focus it', async () => {
		renderAnExistingArticle(2);
		let articlesOnThePage = screen.getAllByRole('article');
		await userEvent.click(articlesOnThePage[1]);
		expect(articlesOnThePage[1]).toHaveFocus();
	});
	it('Click the drag grabber to focus it', async () => {
		renderAnExistingArticle(2);
		let dragGrabbers = screen.getAllByRole('button', { name: (content, element) => element.tagName.toLowerCase() === 'div' });
		await userEvent.click(dragGrabbers[0]);
		expect(dragGrabbers[0]).toHaveFocus();
	});
});
