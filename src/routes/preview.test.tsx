import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { renderAnExistingArticle, clickElement } from '../setupTests';

describe('Preview route tests', () => {
	it('Opening preview route will halt grammar fixing queries', async () => {
		let { router } = renderAnExistingArticle(1);
		let acceptAllButtons = screen.getAllByRole('button', { name: /accept all/i });
		expect(acceptAllButtons).toHaveLength(2);
		expect(acceptAllButtons[0]).toBeDisabled();
		await clickElement(screen.getByRole('link', { name: /preview article/i }));
		expect(router.state.location.pathname).toMatch(/preview$/);
		await new Promise((r) => setTimeout(r, 1000)); // the mocked API response has a 1000ms delay
		await clickElement(screen.getByRole('button', { name: /close/i }));
		acceptAllButtons = screen.getAllByRole('button', { name: /accept all/i });
		expect(acceptAllButtons[1]).toBeDisabled();
		await waitFor(() => {
			expect(acceptAllButtons[1]).toBeEnabled();
		});
	});

	it('Include and remove translation', async () => {
		renderAnExistingArticle(0, true);
		let pTagElementsLength = screen.getAllByText((content, element) => {
			return element?.tagName.toLowerCase() === 'p';
		}).length;
		await clickElement(/include translation/i);
		await waitFor(() => {
			expect(
				screen.getAllByText((content, element) => {
					return element?.tagName.toLowerCase() === 'p';
				}).length
			).toEqual(pTagElementsLength + 1);
		});
		await clickElement(/remove translation/i);
		expect(
			screen.getAllByText((content, element) => {
				return element?.tagName.toLowerCase() === 'p';
			}).length
		).toEqual(pTagElementsLength);
	});

	it('Click the export to file button to reveal available options, click on each export option', async () => {
		// for mocking the navigator.clipboard.writeText
		userEvent.setup();
		renderAnExistingArticle(0, true);
		await clickElement(/export to file/i);
		expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /download docx/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /download image/i })).toBeInTheDocument();

		await clickElement(/download pdf/i);
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/downloading pdf/i)).toBeInTheDocument();

		await clickElement(/download docx/i);
		expect(screen.getByText(/downloading docx/i)).toBeInTheDocument();

		await clickElement(/download image/i);
		expect(screen.getByText(/downloading image/i)).toBeInTheDocument();

		await clickElement(/copy to clipboard/i);
		expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
	});

	it('The "Retry All" button appears when translation requests response with error', async () => {});
});
