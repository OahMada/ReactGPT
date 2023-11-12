import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export function ErrorPage() {
	let error = useRouteError();

	return (
		<div id='error-page'>
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{(isRouteErrorResponse(error) && error.statusText) || (error instanceof Error && error.message)}</i>
			</p>
		</div>
	);
}
