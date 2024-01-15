import { useTranslationQueryVariant } from '../query/translationQuery';
import { PartialParagraph } from '../types';

export var PreviewTranslation = ({ paragraph }: { paragraph: PartialParagraph }) => {
	let result = useTranslationQueryVariant(paragraph);

	// https://tanstack.com/query/latest/docs/react/guides/suspense#throwonerror-default
	if (result.error) {
		throw result.error;
	}

	return (
		<>
			<p>{result.data}</p>
		</>
	);
};
