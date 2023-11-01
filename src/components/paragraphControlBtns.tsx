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
	removeArticle,
} from '../features/articleSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createToast } from '../utils';

// https://github.com/fkhadra/react-toastify/issues/568#issuecomment-779847274
interface UndoProps extends Partial<ToastContentProps> {
	onUndo: () => void;
	closeToast: () => void;
	paragraph: string;
}

// https://stackoverflow.com/questions/70426863/how-to-make-typescript-know-my-variable-is-not-undefined-anymore
function throwIfUndefined<T>(x: T | undefined): asserts x is T {
	if (typeof x === 'undefined') throw new Error(`${x} is undefined`);
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

var ParagraphControlBtns = ({ paragraphId }: { paragraphId: string }) => {
	let dispatch = useAppDispatch();
	let toastId = useRef<Id>();
	const { articleId } = useParams();
	throwIfUndefined(articleId);

	let { paragraphs } = useAppSelector(selectArticle);
	let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;

	let handleParagraphDeletion = () => {
		dispatch(addParagraphToDeletionQueue(paragraphId));

		toast.onChange((toastItem) => {
			if (toastItem.status === 'removed' && toastItem.id === toastId.current) {
				// If the toastId check isn't included, changes to any toast would trigger the following.
				dispatch(finishParagraphDeletion(paragraphId));
				// remove article reference if none paragraphs left
				dispatch(removeArticle({ articleId, mode: 'implicit' }));
			}
		});

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
			containerId: 'paragraphDeletion',
			options: { hideProgressBar: false },
		});
	};

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

export default ParagraphControlBtns;
