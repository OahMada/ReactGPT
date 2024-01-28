import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import secureLocalStorage from 'react-secure-storage';

import { SharedLayout } from '../components';

export function Root() {
	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string');

	return secureLocalStorageAPIKey ? (
		<>
			<SharedLayout />
			<StyledSection id='detail'>
				<Outlet />
			</StyledSection>
		</>
	) : (
		<Navigate to='/config' replace />
	);
}

var StyledSection = styled.section`
	position: relative;
	width: 100%;
	height: 80vh;
	padding: 6rem;
	border: 1px solid #ccc;
`;

// TODO active css effect
