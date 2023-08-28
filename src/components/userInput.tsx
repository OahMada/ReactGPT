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

const UserInput = ({ paragraphId }: { paragraphId?: number }) => {
	let defaultString = `A voiced consonant (or sound) means that it uses the vocal cords and they produce a vibration or humming sound in the throat when they are said. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck / throat. That is because it is a voiced sound.

A voiceless sound (sometimes called an unvoiced sound) is when there is no vibration in your throat and the sound comes from the mouth area. Pronounce the letter P. You will notice how it comes from your mouth (in fact near your lips at the front of your mouth). The P sound doesn't come from your throat.`;

	let { userInput, paragraphs } = useAppSelector(selectArticle);
	let inputState;
	if (paragraphId !== undefined) {
		let currentParagraph = paragraphs.find((item) => item.id === paragraphId) as Paragraph;
		inputState = currentParagraph.paragraphBeforeGrammarFix;
	} else {
		inputState = userInput;
	}

	let [input, setInput] = useState(inputState ? inputState : defaultString);
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
			<button onClick={onClickHandler}>Done</button>
		</>
	);
};
export default UserInput;
