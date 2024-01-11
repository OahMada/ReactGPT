import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderRouter, clickElement } from '../setupTests';

describe('article input route tests', () => {
	it('Create articles', async () => {
		renderRouter();
		await clickElement(/fill in demonstration text/i);
		expect(screen.getByRole('textbox')).toHaveDisplayValue(/A voiced consonant/);
		await clickElement(/done/i);
		expect(screen.getAllByRole('listitem')).toHaveLength(1);
		await clickElement(screen.getByRole('link', { name: /new article/i }));
		let textArea = screen.getByRole('textbox');
		expect(textArea).toBeInTheDocument();
		await userEvent.type(textArea, 'hello world');
		let doneEditingButton = screen.getByRole('button', { name: /done/i });
		await userEvent.hover(doneEditingButton);
		expect(await screen.findByRole('tooltip')).toBeInTheDocument();
		await clickElement(doneEditingButton);
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	it('User inputs splits to correct number of paragraphs', async () => {
		renderRouter();
		let textArea = screen.getByRole('textbox');
		await userEvent.type(textArea, 'hello world');
		await clickElement(/fill in demonstration text/i);
		await clickElement(/done/i);
		expect(screen.getAllByRole('article')).toHaveLength(3);
	});
});
