import styled, { createGlobalStyle } from 'styled-components';

import { ModalWrapper } from './components/modal/modalWrapper';
import { PreviewWrapper } from './routes/preview/previewWrapper';

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
	--paragraph-margin-top: calc(var(--util-icon-container-dimension) + var(--gap-big));
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
	translate: 0 -3px;

	&.hover {
		display: flex;
	}
`;

export var ParagraphWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--gap-big);

	& > p:first-child {
		margin-top: var(--paragraph-margin-top);
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

export var UndoDeletionWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 8px;
`;

// https://www.joshwcomeau.com/css/styled-components/#:~:text=With%20this%20little%20trick%2C%20we%27ve%20inverted%20the%20control
export var Button = styled.button`
	display: inline-block;
	height: var(--util-icon-container-dimension);
	padding: 0 10px;
	border: 1px solid black;
	border-radius: var(--border-radius);
	background-color: white;

	.card & {
		border: none;
		border-radius: var(--border-radius-big);
		background-color: var(--color-dark);
	}

	.article-controls & {
		border-color: var(--color-dark);
		background-color: var(--color-light);
	}

	${ParagraphWrapper} & {
		border-color: var(--color-darker);
		background-color: var(--color-dark);
	}

	${ControlOptionsMenu} & {
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

	${PreviewWrapper} & {
		border-color: var(--color-dark);
		background-color: var(--color-light);
	}

	${ModalWrapper} & {
		padding: 0 5px;
		border: none;
		background-color: transparent;
		font-size: var(--font-small);

		&:hover {
			opacity: 0.6;
		}
	}

	${UndoDeletionWrapper} & {
		padding: 5px;
		border: none;
		box-shadow: 0 0 0.5rem rgb(0 0 0 / 10%);

		&:hover {
			color: var(--color-darkest);
		}
	}
`;

export var BtnContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: var(--gap-primary);
`;
