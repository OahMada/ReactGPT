import styled, { createGlobalStyle, css } from 'styled-components';

var GlobalStyles = createGlobalStyle`
html {
	font-size: 62.5%;

	--font-small-extra: 1.2rem;
	--font-small: 1.4rem;
	--font-big: 2rem;
	--font-primary: 1.6rem;
	--font-larger: 1.8rem;
	--color-light: #eee;
	--color-dark: lightgrey;
	--color-darker: #ccc;
	--color-darkest: gray;
	--color-green: green;
	--border-radius: 5px;
	--border-radius-big: 10px;
	--border-radius-small: 3px;
	--util-icon-container-dimension: 3rem;
	--gap-primary: 5px;
	--gap-small: 3px;
	--gap-big: 8px;
	--gap-huge: 20px;
}

body {
	font-family: sans-serif;
	font-size: var(--font-primary);
	font-weight: 400;
}

#root {
	display: grid;
	min-height: 100dvh;
	grid-template-rows: repeat(auto-fill, 100%);
}

.btn {
	display: inline-block;
	height: 3rem;
	padding: 0 10px;
	border: 1px solid black;
	border-radius: var(--border-radius);

	.card .btn-container & {
		border: none;
		border-radius: var(--border-radius-big);
		background-color: var(--color-dark);
	}
}
`;

export default GlobalStyles;

export var ControlOptionsMenuContainerStyles = css`
	position: absolute;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
`;

export var ControlOptionsMenu = styled.div`
	display: none;
	width: fit-content;
	flex-direction: column;
	align-items: flex-end;
	padding: 5px;
	border: 1px solid var(--color-darker);
	border-radius: var(--border-radius-small);
	background-color: white;
	box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 30%);
	gap: var(--gap-small);

	&:hover {
		display: flex;
	}

	button {
		border: none;
		background-color: transparent;

		&:hover {
			color: var(--color-darkest);
		}

		&:not(:last-child) {
			border-radius: 0;
			border-bottom: 1px solid black;
		}
	}
`;

export var ParagraphWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--gap-primary);

	& > p:first-child {
		margin-top: calc(var(--util-icon-container-dimension) + 5px);
	}
`;

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

export var ErrorBoundaryWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: var(--gap-primary);

	p {
		padding: 8px;
	}
`;
