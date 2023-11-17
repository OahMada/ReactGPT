import { useRef } from 'react';
import { toast, Id, ToastContentProps } from 'react-toastify';
import { useParams } from 'react-router-dom';

import {
	finishParagraphDeletion,
	insertAboveParagraph,
	insertBelowParagraph,
	addParagraphToDeletionQueue,
	undoParagraphDeletion,
	selectArticle,
	Paragraph,
} from '../features/articleSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createToast, throwIfUndefined } from '../utils';

// https://github.com/fkhadra/react-toastify/issues/568#issuecomment-779847274
interface UndoProps extends Partial<ToastContentProps> {
	onUndo: () => void;
	closeToast: () => void;
	paragraph: string;
}

var Undo = ({ closeToast, onUndo, paragraph }: UndoProps) => {
	const handleClick = () => {
		onUndo();
		closeToast();
	};

	return (
		<div>
			Paragraph {paragraph ? `"${paragraph.slice(0, 10)}..." ` : ''}Deleted <button onClick={handleClick}>UNDO</button>
		</div>
	);
};

export var ParagraphControlBtns = ({ paragraphId }: { paragraphId: string }) => {
	let dispatch = useAppDispatch();
	let toastId = useRef<Id>();
	const { articleId } = useParams();
	throwIfUndefined(articleId);

	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;

	let handleParagraphDeletion = () => {
		dispatch(addParagraphToDeletionQueue(paragraphId));

		toastId.current = createToast({
			type: 'error',
			content: (
				<Undo
					onUndo={() => {
						dispatch(undoParagraphDeletion(paragraphId));
					}}
					closeToast={() => {
						toast.dismiss(toastId.current);
					}}
					paragraph={currentParagraph.paragraphAfterGrammarFix}
				/>
			),
			containerId: 'articleDeletion',
			options: { hideProgressBar: false },
		});
	};

	toast.onChange((toastItem) => {
		if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
			// If the toastId check isn't included, changes to any toast would trigger the following.
			dispatch(finishParagraphDeletion({ paragraphId, articleId }));
		}
	});

	return (
		<div>
			<button onClick={handleParagraphDeletion}>Delete Paragraph</button>
			<div>
				<button>Insert New Paragraph</button>
				<button onClick={() => dispatch(insertAboveParagraph(paragraphId))}>Insert Above</button>
				<button onClick={() => dispatch(insertBelowParagraph({ paragraphId }))}>Insert Bellow</button>
			</div>
		</div>
	);
};
