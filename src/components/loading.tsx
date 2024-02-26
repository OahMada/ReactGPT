import styled from 'styled-components';

export var Loading = () => {
	return (
		<StyledP>
			<i>Loading...</i>
		</StyledP>
	);
};

var StyledP = styled.p`
	/* to match the error message */
	padding: 8px;
	padding-left: 0;

	/* reset margin from preview page styles */
	margin-bottom: 0;
	color: var(--color-darkest);
`;
