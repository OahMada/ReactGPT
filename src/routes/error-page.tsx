import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

export function ErrorPage() {
	let error = useRouteError();
	let navigate = useNavigate();

	return (
		<div id='error-page'>
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{(isRouteErrorResponse(error) && error.statusText) || (error instanceof Error && error.message)}</i>
			</p>
			<button onClick={() => navigate('/')}>Back to home page.</button>
		</div>
	);
}
