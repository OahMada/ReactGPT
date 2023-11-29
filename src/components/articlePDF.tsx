import { Document, Page, Text, Font, View, StyleSheet } from '@react-pdf/renderer';

import { PartialParagraphWithTranslation } from '../types';

// https://juejin.cn/post/7101581383545552910
function insertSpace(word: string) {
	return word.replace(/./g, (word) => word + ' ');
}

Font.register({
	family: 'Noto Serif SC',
	src: 'https://fonts.gstatic.com/s/notoserifsc/v22/H4chBXePl9DZ0Xe7gG9cyOj7oqCcbzhqDtg.otf',
});

Font.registerHyphenationCallback((word) => [word]);

export var ArticlePDF = ({ article, includeTranslation }: { article: PartialParagraphWithTranslation[]; includeTranslation: boolean }) => {
	return (
		<Document>
			<Page style={styles.body}>
				{article.map((paragraph) => {
					return (
						<View key={paragraph.paragraphId}>
							<Text style={styles.text}>{paragraph.paragraphText}</Text>
							{includeTranslation && paragraph.paragraphText && (
								<Text style={[styles.text, styles.translation]}>{insertSpace(paragraph.translationText)}</Text>
							)}
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
		fontSize: 14,
		fontFamily: 'Noto Serif SC',
	},
	translation: {
		letterSpacing: -1,
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
