import { screen } from '@testing-library/react';
import { renderRouter, clickElement } from '../setupTests';

describe('error route tests', () => {
	it('Landing on the error page and navigating back to the main page', async () => {
		let { router } = renderRouter({ initialEntries: ['/testing'] });
		expect(screen.getByRole('heading', { name: /Oops/i })).toBeInTheDocument();
		await clickElement();
		expect(router.state.location.pathname).toEqual('/');
	});
});
