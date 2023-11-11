import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'react-use';

import SharedLayout from '../components/sharedLayout';

export default function Root() {
	let [APIKey] = useLocalStorage('APIKey');

	return APIKey ? (
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
	border: 1px solid #ccc;
	padding: 6rem;
	width: 100%;
	height: 80vh;
	position: relative;
`;

// TODO active css effect
