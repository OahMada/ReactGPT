import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderRouter, clickElement, fetchButton } from '../setupTests';

describe('hotkeyMap route tests', () => {
	it('Land on the hotkeyMap route then navigate back to main page', async () => {
		let { router } = renderRouter();
		await clickElement(/hotkey map/i);
		expect(router.state.location.pathname).toEqual('/hotkey');
		await waitFor(() => {
			expect(
				screen.getByText((content, element) => {
					return /config page/i.test(content) && element?.tagName.toLowerCase() === 'caption';
				})
			).toBeInTheDocument();
		});
		await clickElement(screen.getAllByRole('button')[0]);
		expect(router.state.location.pathname).toEqual('/');
	});

	it('Click to alter the default hotkey', async () => {
		renderRouter({ initialEntries: ['/hotkey'] });
		let buttonsOnThePage = screen.getAllByRole('button');
		await clickElement(buttonsOnThePage[1]);
		expect(screen.getAllByRole('button', { name: /done/i })).toHaveLength(1);
		await clickElement(buttonsOnThePage[2]);
		expect(screen.getAllByRole('button', { name: /done/i })).toHaveLength(1);
		await userEvent.keyboard('{Shift>}x');
		await clickElement(fetchButton(/done/i));
		expect(screen.getByText(/shift \+ x/i)).toBeInTheDocument();
	});
});
