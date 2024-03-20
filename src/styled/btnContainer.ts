import styled from 'styled-components';

export var BtnContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin-top: 5px;
	gap: var(--gap-primary);

	@media (width <= 46.875rem) {
		gap: var(--gap-small);
	}
`;
