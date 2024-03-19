import styled from 'styled-components';

export var BtnContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: var(--gap-primary);

	@media (width <= 46.875rem) {
		gap: var(--gap-small);
	}
`;
