import { useTranslationQueryVariant } from '../query/translationQuery';
import { PartialParagraph } from '../types';

var PreviewTranslation = ({ paragraph }: { paragraph: PartialParagraph }) => {
	let result = useTranslationQueryVariant(paragraph);

	if (result.error) {
		throw result.error;
	}

	return (
		<>
			<p>{result.data}</p>
		</>
	);
};

export default PreviewTranslation;
