import styled from 'styled-components';

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
