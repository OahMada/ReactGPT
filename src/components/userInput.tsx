import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useState } from 'react';
import {
	saveInput,
	findGrammarMistakes,
	findArticleGrammarMistakes,
	selectArticle,
	// loadDataFromSessionStorage
	saveParagraphInput,
	Paragraph,
} from '../features/article/articleSlice';
import styles from './userInput.module.css';

const UserInput = ({ paragraphId }: { paragraphId?: string }) => {
	let { userInput, paragraphs } = useAppSelector(selectArticle);
	let inputState;
	if (paragraphId !== undefined) {
		let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
		inputState = currentParagraph.paragraphBeforeGrammarFix;
	} else {
		inputState = userInput;
	}

	let [input, setInput] = useState(inputState);
	let dispatch = useAppDispatch();

	let onClickHandler = () => {
		if (paragraphId !== undefined) {
			dispatch(saveParagraphInput({ paragraphId, paragraphInput: input }));
			dispatch(findGrammarMistakes(paragraphId));
		} else {
			dispatch(saveInput(input));
			// let cachedUserInput = sessionStorage.getItem('initialUserInput');
			// let cachedGrammarFixesData = sessionStorage.getItem('grammarFixes');
			// if (cachedUserInput === input && cachedGrammarFixesData !== null) {
			// 	dispatch(loadDataFromSessionStorage());
			// } else {
			dispatch(findArticleGrammarMistakes());
			// }
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
