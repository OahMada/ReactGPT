import { createGlobalStyle } from 'styled-components';

var GlobalStyles = createGlobalStyle`
/* https://fkhadra.github.io/react-toastify/how-to-style#override-css-variables */
:root {
	--toastify-toast-width: 350px;
}

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
	--gap-primary: 5px;
	--gap-small: 3px;
	--gap-big: 8px;
	--gap-huge: 20px;
	--util-icon-container-dimension: 3.2rem;
	--header-height: min(7rem, 100px);
	--header-offset: min(10rem, 120px);
	--main-content-height: calc(100dvh - var(--header-height));
	--paragraph-width: 70rem;
	--paragraph-margin-top: calc(var(--util-icon-container-dimension) + var(--gap-primary));
	--root-padding: 50px;

	@media (width <= 46.875rem) {
		--root-padding: 30px;
		--header-offset: min(8rem, 100px);
	}
}

body {
	font-family: sans-serif;
	font-size: var(--font-primary);
	font-weight: 400;
}

#root {
	/* https://dev.to/rashidshamloo/preventing-the-layout-shift-caused-by-scrollbars-2flp#:~:text=Positioning%20inside%20a%20100vw%20width%20parent */
	width: 100vw;
	min-height: 100dvh;
}
`;

export default GlobalStyles;
