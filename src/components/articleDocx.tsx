import { Document, Paragraph, Footer, AlignmentType, TextRun, PageNumber, LineRuleType } from 'docx';
import { PartialParagraphWithTranslation } from '../types';

export var articleDocx = ({ article, includeTranslation }: { article: PartialParagraphWithTranslation[]; includeTranslation: boolean }) => {
	return new Document({
		sections: [
			{
				footers: {
					default: new Footer({
						children: [
							new Paragraph({
								alignment: AlignmentType.RIGHT,
								children: [
									new TextRun({
										children: [PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES],
									}),
								],
							}),
						],
					}),
				},
				children: [
					...article.reduce<Paragraph[]>((acc, paragraph) => {
						acc.push(
							new Paragraph({
								spacing: {
									after: 300,
								},
								text: paragraph.paragraphText,
							})
						);
						if (includeTranslation && paragraph.translationText) {
							acc.push(
								new Paragraph({
									spacing: {
										after: 300,
									},
									text: paragraph.translationText,
								})
							);
						}
						return acc;
					}, []),
				],
			},
		],
	});
};
