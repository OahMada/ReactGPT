import styled from 'styled-components';
import { ControlOptionsMenuContainerStyles } from '../../styled';

export var PreviewWrapper = styled.section`
	position: fixed;
	z-index: 2;
	top: 0;
	left: 0;
	display: grid;
	width: 100dvw;
	height: 100dvh;
	background-color: rgb(0 0 0 / 80%);
	isolation: isolate;
	place-items: center center;

	.paragraphs {
		position: relative;
		display: flex;
		width: var(--paragraph-width);
		min-height: 60%;
		max-height: 80%;
		flex-flow: column wrap;
		border-radius: var(--border-radius-small);
		background-color: white;
		box-shadow: 0 2rem 4rem rgb(0 0 0 / 20%);
		overflow-y: scroll;

		@media (width <= 46.875rem) {
			width: 100%;
		}

		.preview-header {
			position: fixed;
			display: flex;
			width: inherit;
			justify-content: space-between;
			padding: 30px;
			padding-bottom: 10px;
			border-radius: var(--border-radius-small);
			background-color: white;

			@media (width <= 46.875rem) {
				padding-bottom: calc(10px + var(--util-icon-container-dimension));
			}
		}

		.btn-container {
			display: flex;
			min-height: 30px;
			margin-right: auto;
			gap: var(--gap-primary);
		}

		.export-options-container {
			right: 30px;
			${ControlOptionsMenuContainerStyles}

			@media (width <= 46.875rem) {
				top: calc(var(--util-icon-container-dimension) * 2 + 2px);
				left: 30px;
			}
		}

		.preview-content {
			padding: 20px;
			border: 1px solid var(--color-dark);
			border-radius: var(--border-radius);
			margin: 30px;
			margin-top: calc(40px + var(--util-icon-container-dimension));

			@media (width <= 46.875rem) {
				margin-top: calc(40px + var(--util-icon-container-dimension) * 2);
			}

			p {
				font-size: var(--font-primary);
			}

			& > p:not(:last-child) {
				margin-bottom: 0.8rem;
			}
		}
	}
`;
