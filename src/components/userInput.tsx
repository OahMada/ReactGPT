import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveInput, selectArticle, saveParagraphInput, Paragraph } from '../features/article/articleSlice';
import styles from './userInput.module.css';

const UserInput = ({ paragraphId }: { paragraphId?: string }) => {
	let { userInput, paragraphs } = useAppSelector(selectArticle);

	let inputState;
	if (paragraphId !== undefined) {
		let currentParagraph = paragraphs.find((item: Paragraph) => item.id === paragraphId) as Paragraph;
		inputState = currentParagraph.paragraphBeforeGrammarFix;
	} else {
		inputState = userInput;
	}

	let [input, setInput] = useState(inputState);
	let dispatch = useAppDispatch();

	let onClickHandler = () => {
		// click paragraph for editing
		if (paragraphId !== undefined) {
			dispatch(saveParagraphInput({ paragraphId, paragraphInput: input }));
		} else {
			dispatch(saveInput(input));
		}
	};

	return (
		<>
			<textarea className={styles.textarea} value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
			<button onClick={onClickHandler} disabled={input === ''}>
				Done
			</button>
		</>
	);
};
export default UserInput;
