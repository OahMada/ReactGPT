import styled from 'styled-components';
import { ControlOptionsMenuContainerStyles } from '../ControlOptionsMenuContainerStyles';

export var PreviewWrapper = styled.section`
	position: fixed;
	top: 0;
	left: 0;
	display: grid;
	width: 100vw;
	height: 100dvh;
	background-color: rgb(0 0 0 / 80%);
	isolation: isolate;
	place-items: center center;

	.paragraphs {
		position: relative;
		display: flex;
		width: 70rem;
		min-height: 60%;
		max-height: 80%;
		flex-direction: column;
		border-radius: var(--border-radius-small);
		background-color: white;
		box-shadow: 0 2rem 4rem rgb(0 0 0 / 20%);
		overflow-y: scroll;

		.preview-header {
			position: fixed;
			display: flex;
			width: inherit;
			justify-content: space-between;
			padding: 30px;
			padding-bottom: 10px;
			border-radius: var(--border-radius-small);
			background-color: white;
		}

		.btn-container {
			display: flex;
			min-height: 30px;
			gap: var(--gap-primary);
		}

		.export-options-container {
			right: 30px;
			${ControlOptionsMenuContainerStyles}
		}

		.preview-content {
			flex-grow: 1;
			padding: 20px;
			border: 1px solid var(--color-dark);
			border-radius: var(--border-radius);
			margin: 30px;
			margin-top: calc(40px + var(--util-icon-container-dimension));

			p {
				font-size: var(--font-primary);
			}

			& > p:not(:last-child) {
				margin-bottom: 0.8rem;
			}
		}
	}
`;
