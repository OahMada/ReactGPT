import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { useKeys, HotkeyMapData } from '../utils';
import styled from 'styled-components';
import { Button } from '../styled/button';

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
				<div>
					<h1>Oops!</h1>
					<p>Sorry, an unexpected error has occurred.</p>
					<p>
						<i>{(isRouteErrorResponse(error) && error.statusText) || (error instanceof Error && error.message)}</i>
					</p>
				</div>
				<Button onClick={handleClick} data-tooltip-id='hotkey' data-tooltip-content={errorPageHotkeys.back.label}>
					Back to home page
				</Button>
			</div>
		</StyledDiv>
	);
}

var StyledDiv = styled.div`
	display: grid;
	height: 100dvh;
	place-content: center;

	p:last-child {
		margin-top: 0.8rem;
		color: red;
	}

	button {
		width: fit-content;
		margin-top: var(--gap-huge);
	}
`;
