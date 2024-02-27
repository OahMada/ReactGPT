import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import secureLocalStorage from 'react-secure-storage';

import { Footer, Header } from '../components';

export function Root() {
	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string');

	return secureLocalStorageAPIKey ? (
		<>
			<Header />
			<StyledMain>
				<Outlet />
			</StyledMain>
			<Footer />
		</>
	) : (
		<Navigate to='/config' replace />
	);
}

var StyledMain = styled.main`
	display: grid;
	max-width: 85rem;
	padding: 50px;
	padding-top: min(8rem, 110px);
	padding-bottom: 0%;
	margin: 0 auto;
	grid-template-rows: min-content auto;
	row-gap: var(--gap-huge);
`;
