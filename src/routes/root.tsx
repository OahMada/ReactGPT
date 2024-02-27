import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import secureLocalStorage from 'react-secure-storage';

import { SharedLayout } from '../components';

export function Root() {
	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string');

	return secureLocalStorageAPIKey ? (
		<StyledDiv>
			<SharedLayout />
			<main>
				<Outlet />
			</main>
		</StyledDiv>
	) : (
		<Navigate to='/config' replace />
	);
}

var StyledDiv = styled.div`
	display: grid;
	max-width: 85rem;
	padding: 50px;
	margin: 0 auto;
	grid-template-columns: repeat(12, 1fr);
	grid-template-rows: min-content min-content auto;
	row-gap: var(--gap-huge);

	main {
		grid-column: 1 / span 12;
	}
`;
