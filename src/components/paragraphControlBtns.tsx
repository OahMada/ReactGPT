import { deleteParagraphs, insertAboveParagraph, insertBelowParagraph } from '../features/article/articleSlice';
import { useAppDispatch } from '../app/hooks';

var ParagraphControlBtns = ({ paragraphId }: { paragraphId: string }) => {
	let dispatch = useAppDispatch();
	return (
		<div>
			<button onClick={() => dispatch(deleteParagraphs(paragraphId))}>Delete Paragraph</button>
			<div>
				<button>Insert New Paragraph</button>
				<button onClick={() => dispatch(insertAboveParagraph(paragraphId))}>Insert Above</button>
				<button onClick={() => dispatch(insertBelowParagraph(paragraphId))}>Insert Bellow</button>
			</div>
		</div>
	);
};

export default ParagraphControlBtns;
