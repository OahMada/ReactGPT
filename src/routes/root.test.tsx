import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderRouter, clickButton, prepareStoreForArticlePageTests } from '../setupTests';

describe('Root route (shared layout) tests', () => {
	it('Search articles', async () => {
		let {
			store,
			articleIdArr: [articleId],
		} = prepareStoreForArticlePageTests();
		renderRouter({ store, initialEntries: [`/article/${articleId}`] });
		screen.debug();
	});
	it('Pin article', async () => {});
	it('Delete article', async () => {});
	it('Click to render article', async () => {});
});
