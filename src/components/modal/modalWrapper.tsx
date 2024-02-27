import styled from 'styled-components';

export var ModalWrapper = styled.div<{ $displayModal: boolean; $leftOffset: number }>`
	position: fixed;
	top: calc((var(--position-top) + var(--position-top-offset)) * 1px);
	left: calc(var(--position-left) * 1px + ${({ $leftOffset }) => ($leftOffset ? `${$leftOffset} * 1px - 1rem` : '-0.5rem')});

	/* to move into viewport in the case of viewport overflow */
	display: ${({ $displayModal }) => ($displayModal ? 'flex' : 'none')};
	width: fit-content;
	flex-direction: column;
	justify-content: space-around;
	padding: 10px;
	border: 1px solid black;
	border-radius: var(--border-radius-small);
	background-color: white;

	.title {
		font-size: var(--font-small-extra);
		font-style: italic;
		font-weight: 300;
		text-decoration: underline 3px;
		text-decoration-color: var(--color);
	}

	.content {
		margin-top: 10px;
		font-size: var(--font-larger);

		cite {
			font-style: inherit;
		}
	}

	.btn-container {
		display: flex;
		justify-content: flex-start;
		margin-top: 10px;
		gap: var(--gap-primary);
	}

	.accept-btn {
		color: var(--color-green);
	}

	.ignore-btn {
		color: var(--color-darkest);
	}
`;
