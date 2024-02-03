import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import secureLocalStorage from 'react-secure-storage';
import { useLocation } from 'react-router-dom';

import { SharedLayout } from '.';

export function Root() {
	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string');
	let location = useLocation();

	return secureLocalStorageAPIKey ? (
		<StyledDiv>
			<SharedLayout />
			{!/articles$/.test(location.pathname) && (
				<main>
					<Outlet />
				</main>
			)}
		</StyledDiv>
	) : (
		<Navigate to='/config' replace />
	);
}

var StyledDiv = styled.div`
	display: grid;
	padding: 5rem;
	font-size: var(--font-primary);
	grid-template-columns: repeat(12, 1fr);
	grid-template-rows: min-content min-content auto;
	row-gap: 2rem;

	header {
		grid-column: 1 / span 12;
	}

	nav {
		grid-column: 1 / span 12;
	}

	main {
		grid-column: 1 / span 12;
	}
`;

// TODO active css effect
