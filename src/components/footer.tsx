import styled from 'styled-components';

export var Footer = () => {
	return (
		<StyledFooter>
			<p>&copy; 2023-present Adam Hao. All Rights Reserved.</p>
		</StyledFooter>
	);
};

var StyledFooter = styled.footer`
	z-index: 500;
	display: flex;
	width: 100vw;
	height: min(7rem, 100px);
	align-items: center;
	justify-content: center;
	background-color: white;
	box-shadow: 0 -0.5rem 0.5rem rgb(0 0 0 / 5%);

	p {
		font-size: var(--font-small);
	}
`;
