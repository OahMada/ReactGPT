import { Document, Page, Text, Font, View, StyleSheet } from '@react-pdf/renderer';

import { PartialParagraph } from '../types';

type PartialParagraphWithTranslation = PartialParagraph & {
	translationText: string;
};

Font.register({
	family: 'Microsoft Yahei',
	src: 'https://github.com/chenqing/ng-mini/blob/master/font/msyh.ttf',
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
		fontFamily: 'Microsoft Yahei',
	},
});

/**
TODO

title
page number
 */
