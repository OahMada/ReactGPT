import { Document, Page, Text, Font, View, StyleSheet } from '@react-pdf/renderer';

import { PartialParagraph } from '../types';

type PartialParagraphWithTranslation = PartialParagraph & {
	translationText: string;
};

Font.register({
	family: 'Noto Serif SC',
	src: 'https://fonts.gstatic.com/s/notoserifsc/v22/H4chBXePl9DZ0Xe7gG9cyOj7oqCcbzhqDtg.otf',
});

Font.registerHyphenationCallback((word) => [word]);

export var ArticlePDF = ({ article, includeTranslation }: { article: PartialParagraphWithTranslation[]; includeTranslation: boolean }) => {
	return (
		<Document>
			<Page
			// style={styles.body}
			>
				{article.map((paragraph) => {
					return (
						<View key={paragraph.paragraphId}>
							<Text style={styles.text}>{paragraph.paragraphText}</Text>
							{includeTranslation && <Text style={styles.text}>{paragraph.translationText}</Text>}
						</View>
					);
				})}
				<Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
			</Page>
		</Document>
	);
};

var styles = StyleSheet.create({
	body: {
		paddingTop: 35,
		paddingBottom: 65,
		paddingHorizontal: 35,
	},
	text: {
		margin: 12,
		textAlign: 'left',
		fontSize: '9pt',
		fontFamily: 'Noto Serif SC',
	},

	pageNumber: {
		position: 'absolute',
		fontSize: 12,
		bottom: 30,
		left: 0,
		right: 0,
		textAlign: 'center',
		color: 'grey',
	},
});
