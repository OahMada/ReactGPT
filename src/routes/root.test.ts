import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { clickElement, renderAnExistingArticle, fetchElementsByTagName } from '../setupTests';

describe('Root route (shared layout) tests', () => {
	it('Search articles', async () => {
		renderAnExistingArticle();
		let articleCards = screen.getAllByText((content, element) => element?.className === 'card-content');
		expect(articleCards).toHaveLength(3);
		// changing article rendered does not clear search
		let searchBox = screen.getByRole('searchbox');
		await clickElement(articleCards[1]);
		await userEvent.type(searchBox, 'hello');
		expect(searchBox).toHaveValue('hello');
		await clickElement(articleCards[0]);
		expect(searchBox).toHaveValue('hello');
		articleCards = screen.getAllByText((content, element) => element?.className === 'card-content');
		expect(articleCards).toHaveLength(1);
		await userEvent.clear(searchBox);
		await userEvent.type(searchBox, 'test');
		expect(screen.getByText(/no articles match the search query/i)).toBeInTheDocument();
	});
	it('Pin article', async () => {
		// I don't know how to make the article card position change take effect.
		renderAnExistingArticle();
		let paragraphsOnThePage = await fetchElementsByTagName('p');
		expect(paragraphsOnThePage[0]).toHaveTextContent(/hello/i);
		let pinButtons = screen.getAllByRole('button', { name: /^pin/i });
		expect(pinButtons).toHaveLength(4);
		await clickElement(pinButtons[1]);
		// paragraphsOnThePage = await fetchElementsByTagName('p');
		// expect(paragraphsOnThePage[0]).toHaveTextContent(/A voiced/i);
		expect(screen.getAllByRole('button', { name: /^pin/i })).toHaveLength(3);
		await clickElement('Unpin');
		// paragraphsOnThePage = await fetchElementsByTagName('p');
		// expect(paragraphsOnThePage[0]).toHaveTextContent(/A voiced/i);
	});
	it('Delete article', async () => {
		renderAnExistingArticle();
		let deleteArticleButtons = screen.getAllByRole('button', { name: /delete$/i });
		expect(deleteArticleButtons).toHaveLength(3);
		await clickElement(deleteArticleButtons[0]);
		let deletedArticle = screen.queryByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p' && content.startsWith('Hello');
		});
		expect(deletedArticle).not.toBeInTheDocument();
		deleteArticleButtons = screen.getAllByRole('button', { name: /delete$/i });
		expect(deleteArticleButtons).toHaveLength(2);
	});
	it('Click to render article', async () => {
		renderAnExistingArticle();
		let articleParagraphs = screen.getAllByRole('article');
		expect(articleParagraphs).toHaveLength(1);
		await clickElement(
			screen.getAllByText((content, element) => {
				return element?.tagName.toLowerCase() === 'p' && content.startsWith('A voiced');
			})[1]
		);
		articleParagraphs = screen.getAllByRole('article');
		expect(articleParagraphs).toHaveLength(2);
	});
});
