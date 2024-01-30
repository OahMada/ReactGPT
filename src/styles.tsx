import { createGlobalStyle } from 'styled-components';

var GlobalStyles = createGlobalStyle`
*,
*::after,
*::before {
	box-sizing: inherit;
	padding: 0;
	margin: 0;
}

html {
	box-sizing: border-box;
	font-size: 62.5%;
	
	--font-big: 2rem;
	--font-primary: 1.6rem;
	--font-larger: 1.8rem;
	--color-light: #eee;
	--color-dark: lightgrey;
}

body {
	/* padding: 3rem; */
	font-family: sans-serif;
	font-weight: 400;
	line-height: 1.7;

	/* min-height: 100vh; */
}

#root {
	display: grid;
	width: 100%;
	min-height: 100vh;
	place-content: center;
}

.btn {
	display: inline-block;
	height: 3rem;
	padding: 0 1rem;
}
`;

export default GlobalStyles;
