import { useTranslationQueryVariant } from '../query/translationQuery';
import { PartialParagraph } from '../types';

export var PreviewTranslation = ({ includeTranslation, paragraph }: { includeTranslation: boolean; paragraph: PartialParagraph }) => {
	let result = useTranslationQueryVariant(paragraph, includeTranslation);

	let translationText: string = '';
	if (result.isFetching) {
		translationText = 'Loading...';
	} else if (result.data) {
		translationText = result.data;
	}

	return (
		<>
			<p>{translationText}</p>
		</>
	);
};
