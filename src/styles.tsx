import { createGlobalStyle } from 'styled-components';

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
