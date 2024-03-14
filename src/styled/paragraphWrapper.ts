import styled from 'styled-components';

export var ParagraphWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--gap-big);

	& > p:first-child {
		margin-top: var(--paragraph-margin-top);
	}
`;
