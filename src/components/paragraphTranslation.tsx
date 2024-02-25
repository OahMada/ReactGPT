import styled from 'styled-components';

import { StyledParagraph } from '../styles';
import { useTranslationQuery } from '../query/translationQuery';
import { PartialParagraph } from '../types';

export const ParagraphTranslation = ({ paragraph: { paragraphId, paragraphText } }: { paragraph: PartialParagraph }) => {
	let { isFetching: isTranslationFetching, data: translationText } = useTranslationQuery(paragraphText, paragraphId);
	return (
		<>
			<StyledParagraph>{isTranslationFetching ? <StyledI>Loading...</StyledI> : translationText}</StyledParagraph>
		</>
	);
};

var StyledI = styled.i`
	color: var(--color-darkest);
`;
