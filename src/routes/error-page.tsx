import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { useKeys, HotkeyMapData } from '../utils';
import styled from 'styled-components';

export function ErrorPage() {
	let error = useRouteError();
	let navigate = useNavigate();

	let { 'Error Page': errorPageHotkeys } = HotkeyMapData();

	let handleClick = () => {
		navigate('/');
	};

	useKeys({
		keyBinding: errorPageHotkeys.back.hotkey,
		callback: handleClick,
	});

	return (
		<StyledDiv>
			<div>
				<h1>Oops!</h1>
				<p>Sorry, an unexpected error has occurred.</p>
				<p>
					<i>{(isRouteErrorResponse(error) && error.statusText) || (error instanceof Error && error.message)}</i>
				</p>
			</div>
			<button onClick={handleClick} data-tooltip-id='hotkey' data-tooltip-content={errorPageHotkeys.back.label}>
				Back to home page
			</button>
		</StyledDiv>
	);
}

var StyledDiv = styled.div`
	display: grid;
	width: 100%;
	gap: 2rem;
	place-content: center;

	p:last-child {
		margin-top: 0.8rem;
		color: red;
	}
`;
