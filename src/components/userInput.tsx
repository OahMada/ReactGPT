import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useState } from 'react';
import {
	saveInput,
	findArticleGrammarMistakes,
	selectArticle,
	// loadDataFromSessionStorage
} from '../features/article/articleSlice';
import styles from './userInput.module.css';

const UserInput = () => {
	let defaultString = `A voiced consonant (or sound) means that it uses the vocal cords and they produce a vibration or humming sound in the throat when they are said. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck / throat. That is because it is a voiced sound.

A voiceless sound (sometimes called an unvoiced sound) is when there is no vibration in your throat and the sound comes from the mouth area. Pronounce the letter P. You will notice how it comes from your mouth (in fact near your lips at the front of your mouth). The P sound doesn't come from your throat.`;

	let { userInput } = useAppSelector(selectArticle);
	let [input, setInput] = useState(userInput ? userInput : defaultString);
	let dispatch = useAppDispatch();

	let onClickHandler = () => {
		dispatch(saveInput(input));
		// let cachedUserInput = sessionStorage.getItem('initialUserInput');
		// let cachedGrammarFixesData = sessionStorage.getItem('grammarFixes');
		// if (cachedUserInput === input && cachedGrammarFixesData !== null) {
		// 	dispatch(loadDataFromSessionStorage());
		// } else {
		dispatch(findArticleGrammarMistakes());
		// }
	};

	return (
		<>
			<textarea className={styles.textarea} value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
			<button onClick={onClickHandler}>Done</button>
		</>
	);
};
export default UserInput;
