import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderRouter, clickButton } from '../setupTests';

describe('article input route tests', () => {
	it('Create articles', async () => {
		renderRouter();
		await clickButton(/fill in demonstration text/i);
		expect(screen.getByRole('textbox')).toHaveDisplayValue(/A voiced consonant/);
		await clickButton(/done/i);
		expect(screen.getAllByRole('listitem')).toHaveLength(1);
		await userEvent.click(screen.getByRole('link', { name: /new article/i }));
		let textArea = screen.getByRole('textbox');
		expect(textArea).toBeInTheDocument();
		await userEvent.type(textArea, 'hello world');
		let doneEditingButton = screen.getByRole('button', { name: /done/i });
		await userEvent.hover(doneEditingButton);
		expect(await screen.findByRole('tooltip')).toBeInTheDocument();
		await userEvent.click(doneEditingButton);
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	it('User inputs splits to correct number of paragraphs', async () => {
		renderRouter();
		let textArea = screen.getByRole('textbox');
		await userEvent.type(textArea, 'hello world');
		await clickButton(/fill in demonstration text/i);
		await clickButton(/done/i);
		expect(screen.getAllByRole('article')).toHaveLength(3);
	});
});
