import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { useKeys, hotkeyMap } from '../utils';

var { errorPage: errorPageHotkeys } = hotkeyMap;

export function ErrorPage() {
	let error = useRouteError();
	let navigate = useNavigate();

	useKeys({
		keyBinding: errorPageHotkeys.back.hotkey,
		callback: () => {
			navigate('/');
		},
	});

	return (
		<div id='error-page'>
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{(isRouteErrorResponse(error) && error.statusText) || (error instanceof Error && error.message)}</i>
			</p>
			<button onClick={() => navigate('/')} data-tooltip-id='hotkey' data-tooltip-content={errorPageHotkeys.back.label}>
				Back to home page.
			</button>
		</div>
	);
}
