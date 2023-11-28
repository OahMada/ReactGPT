import { BorderStyle, Document, Paragraph, TextRun } from 'docx';

export var articleDocx = () => {
	return new Document({
		sections: [
			{
				children: [
					new Paragraph({
						children: [new TextRun('Hello World')],
					}),
				],
			},
		],
	});
};
