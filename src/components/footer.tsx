import styled from 'styled-components';

export var Footer = () => {
	return (
		<StyledFooter>
			<p>&copy; 2023-present Adam Hao. All Rights Reserved.</p>
		</StyledFooter>
	);
};

var StyledFooter = styled.footer`
	display: flex;
	width: 100vw;
	height: var(--header-height);
	align-items: center;
	justify-content: center;
	background-color: white;

	p {
		font-size: var(--font-small);
	}
`;
