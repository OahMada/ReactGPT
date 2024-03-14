import styled from 'styled-components';

export var StyledParagraph = styled.p`
	padding: 10px;
	border: 1px solid var(--color-darker);
	border-radius: var(--border-radius);
	font-size: 1.6rem;
	letter-spacing: 2px;

	.insert {
		background-color: lightgreen;
		text-decoration: none;
	}

	.replacement {
		background-color: lightblue;
	}

	.deletion {
		background-color: lightcoral;
	}
`;
