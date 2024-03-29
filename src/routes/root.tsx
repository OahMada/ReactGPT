import { Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import secureLocalStorage from 'react-secure-storage';

import { Footer, Header, IntersectionContextWrapper } from '../components';

export function Root() {
	let secureLocalStorageAPIKey = secureLocalStorage.getItem('string');

	return secureLocalStorageAPIKey ? (
		<>
			<Header />
			<StyledMain>
				<IntersectionContextWrapper>
					<Outlet />
				</IntersectionContextWrapper>
			</StyledMain>
			<Footer />
		</>
	) : (
		<Navigate to='/config' replace />
	);
}

var StyledMain = styled.main`
	display: flex;
	width: min(110rem, 100%);
	min-height: var(--main-content-height);
	justify-content: center;
	padding: var(--root-padding);
	padding-top: 0;
	padding-bottom: 0;
	margin: 0 auto;

	/* https://www.reddit.com/r/chrome/comments/i98sta/has_scroll_anchoring_behavior_changed_for_focused/ */
	overflow-anchor: none;
`;
