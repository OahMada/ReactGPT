import { screen, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';

import { renderAnExistingArticle, clickElement, server, fetchButton, fetchElementsByTagName } from '../../setupTests';

describe('Preview route tests', () => {
	it('Opening preview route will halt grammar fixing queries', async () => {
		let { router } = renderAnExistingArticle(1);
		expect(fetchButton(/accept all/i)).toBeDisabled();
		await clickElement(screen.getByRole('link', { name: /preview article/i }));
		expect(router.state.location.pathname).toMatch(/preview$/);
		// ??
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		await clickElement(fetchButton(/close/i));
		let acceptAllBtn = fetchButton(/accept all/i);
		expect(acceptAllBtn).toBeDisabled();
		await waitFor(() => {
			expect(acceptAllBtn).toBeEnabled();
		});
	});
	it('Include and remove translation', async () => {
		renderAnExistingArticle(0, true);
		let pTagElementsLength = (await fetchElementsByTagName('p')).length;
		await clickElement(/include translation/i);
		await waitFor(async () => {
			expect((await fetchElementsByTagName('p')).length).toEqual(pTagElementsLength + 1);
		});
		await clickElement(/remove translation/i);
		expect((await fetchElementsByTagName('p')).length).toEqual(pTagElementsLength);
	});
	it('Click the export to file button to reveal available options, click on each export option', async () => {
		// https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#1-when-using-jestusefaketimers
		renderAnExistingArticle(0, true);
		await userEvent.hover(fetchButton(/export to file/i));
		expect(fetchButton(/download pdf/i)).toBeInTheDocument();
		expect(fetchButton(/download docx/i)).toBeInTheDocument();
		expect(fetchButton(/download image/i)).toBeInTheDocument();

		await clickElement(/download pdf/i);
		act(() => vi.runAllTimers());
		expect(await screen.findByRole('alert')).toBeInTheDocument();
		expect(await screen.findByText(/downloading pdf/i)).toBeInTheDocument();

		await clickElement(/download docx/i);
		act(() => vi.runAllTimers());
		expect(await screen.findByText(/downloading docx/i)).toBeInTheDocument();

		await clickElement(/download image/i);
		act(() => vi.runAllTimers());
		expect(await screen.findByText(/downloading image/i)).toBeInTheDocument();

		await clickElement(/include translation/i);
		await waitFor(() => {
			let loadingMessages = screen.queryAllByText(/Loading/);
			expect(loadingMessages).toHaveLength(0);
		});
		await clickElement(/copy to clipboard/i);
		act(() => vi.runAllTimers());
		expect(await screen.findByText(/copied to clipboard/i)).toBeInTheDocument();
		// somehow it is not possible to check if the react toastify toasts disappear.
	});
	it('The "Retry All" button appears when translation requests response with error', async () => {
		server.use(
			http.post('/.netlify/functions/fetchTranslation', async () => {
				return new HttpResponse(null, { status: 500 });
			})
		);
		renderAnExistingArticle(2, true);
		await clickElement(/include translation/i);
		expect(await fetchButton({ type: 'find', name: /retry all/i })).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /retry$/i })).toHaveLength(2);
		server.resetHandlers();
		await clickElement(/retry all/i);
		await waitFor(() => {
			expect(fetchButton({ type: 'query', name: /retry all/i })).not.toBeInTheDocument();
		});
		expect(fetchButton({ type: 'query', name: /retry$/i })).not.toBeInTheDocument();
	});
	it('Closing the preview modal cancels any ongoing query', async () => {
		renderAnExistingArticle(1, true);
		await clickElement(/include translation/i);
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
		await clickElement(/close/i);
		await clickElement(screen.getByRole('link', { name: /preview article/i }));
		// the below step is not needed, I don't know why
		// await clickElement(/include translation/i);
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});
});
