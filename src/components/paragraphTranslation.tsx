import { StyledParagraph } from './paragraph';
import { useTranslationQuery } from '../query/translationQuery';
import { PartialParagraph } from '../routes/preview';

export const ParagraphTranslation = ({ paragraph: { paragraphId, paragraphText } }: { paragraph: PartialParagraph }) => {
	let { isFetching: isTranslationFetching, data: translationText } = useTranslationQuery(paragraphText, paragraphId);
	return (
		<>
			<StyledParagraph>{isTranslationFetching ? 'Loading...' : translationText}</StyledParagraph>
		</>
	);
};
