import { ModalWrapper } from '../components/modal/modalWrapper';
import { PreviewWrapper } from '../routes/preview/previewWrapper';
import styled from 'styled-components';

import { ParagraphWrapper, ControlOptionsMenu, UndoDeletionWrapper } from '.';

// https://www.joshwcomeau.com/css/styled-components/#:~:text=With%20this%20little%20trick%2C%20we%27ve%20inverted%20the%20control
export var Button = styled.button`
	display: inline-block;
	height: var(--util-icon-container-dimension);
	padding: 0 10px;
	border: 1px solid black;
	border-radius: var(--border-radius);
	background-color: white;
	color: black;

	@media (width <= 46.875rem) {
		padding: 0 5px;
	}

	@media (width <= 28.125rem) {
		font-size: var(--font-small);
	}

	&:disabled {
		opacity: 0.4;
	}

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
