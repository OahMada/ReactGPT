import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { clickElement, renderAnExistingArticle } from '../setupTests';

describe('Root route (shared layout) tests', () => {
	it('Search articles', async () => {
		renderAnExistingArticle();
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
		let searchBox = screen.getByRole('searchbox');
		await userEvent.type(searchBox, 'hello');
		expect(searchBox).toHaveValue('hello');
		expect(screen.getAllByRole('listitem')).toHaveLength(1);
		await userEvent.clear(searchBox);
		await userEvent.type(searchBox, 'test');
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});
	it('Pin article', async () => {
		renderAnExistingArticle();
		let paragraphsOnThePage = screen.getAllByRole('paragraph');
		expect(paragraphsOnThePage[0]).toHaveTextContent(/hello/i);
		let pinButtons = screen.getAllByRole('button', { name: /^pin/i });
		expect(pinButtons).toHaveLength(3);
		await clickElement(pinButtons[1]);
		paragraphsOnThePage = screen.getAllByRole('paragraph');
		expect(paragraphsOnThePage[0]).toHaveTextContent(/A voiced/i);
		expect(screen.getAllByRole('button', { name: /^pin/i })).toHaveLength(2);
		clickElement('Unpin');
		paragraphsOnThePage = screen.getAllByRole('paragraph');
		expect(paragraphsOnThePage[0]).toHaveTextContent(/A voiced/i);
	});
	it('Delete article', async () => {
		renderAnExistingArticle();
		let deleteArticleButtons = screen.getAllByRole('button', { name: /delete$/i });
		expect(deleteArticleButtons).toHaveLength(2);
		await clickElement(deleteArticleButtons[0]);
		let paragraphsOnThePage = screen.getAllByRole('paragraph');
		expect(paragraphsOnThePage[0]).toHaveTextContent(/A voiced/i);
		deleteArticleButtons = screen.getAllByRole('button', { name: /delete$/i });
		expect(deleteArticleButtons).toHaveLength(1);
	});
	it('Click to render article', async () => {
		renderAnExistingArticle();
		let articleParagraphs = screen.getAllByRole('article');
		expect(articleParagraphs).toHaveLength(1);
		await clickElement(screen.getAllByRole('paragraph')[1]);
		articleParagraphs = screen.getAllByRole('article');
		expect(articleParagraphs).toHaveLength(2);
	});
});
