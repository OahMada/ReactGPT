import { Document, Page, Text, Font, View, StyleSheet } from '@react-pdf/renderer';

import { PartialParagraph } from '../types';

type PartialParagraphWithTranslation = PartialParagraph & {
	translationText: string;
};

Font.register({
	family: 'Noto Serif SC',
	src: 'https://fonts.gstatic.com/s/notoserifsc/v22/H4chBXePl9DZ0Xe7gG9cyOj7oqCcbzhqDtg.otf',
});

export var ArticlePDF = ({ article, includeTranslation }: { article: PartialParagraphWithTranslation[]; includeTranslation: boolean }) => {
	return (
		<Document>
			<Page>
				{article.map((paragraph) => {
					return (
						<View key={paragraph.paragraphId}>
							<Text>{paragraph.paragraphText}</Text>
							<Text style={styles.translation}>{includeTranslation && paragraph.translationText}</Text>
						</View>
					);
				})}
			</Page>
		</Document>
	);
};

var styles = StyleSheet.create({
	translation: {
		fontFamily: 'Noto Serif SC',
	},
});

/**
TODO
font
title
page number
 */
