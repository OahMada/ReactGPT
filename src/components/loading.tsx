import styled from 'styled-components';

export var Loading = () => {
	return (
		<StyledP>
			<i>Loading...</i>
		</StyledP>
	);
};

var StyledP = styled.p`
	color: var(--color-darkest);
`;
