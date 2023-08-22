import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useState } from 'react';
import { saveInput, findGrammarMistakes, selectArticle } from '../features/article/articleSlice';
import styles from './userInput.module.css';

const UserInput = () => {
	let defaultString = `A voiced consonant (or sound) means that it uses the vocal cords and they produce a vibration or humming sound in the throat when they are said. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck / throat. That is because it is a voiced sound.`;

	let { initialArticle } = useAppSelector(selectArticle);
	let [userInput, setUserInput] = useState(initialArticle ? initialArticle : defaultString);
	let dispatch = useAppDispatch();

	return (
		<>
			<textarea className={styles.textarea} value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus />
			<button
				onClick={() => {
					dispatch(saveInput(userInput));
					dispatch(findGrammarMistakes(userInput)); // add logic to load cached data here
				}}
			>
				Done
			</button>
		</>
	);
};
export default UserInput;

/**
 
let cachedUserInput = sessionStorage.getItem('initialUserInput');
// console.log(cachedUserInput);
// console.log(rawArticle);
// console.log(cachedUserInput === rawArticle);
if (cachedUserInput === rawArticle) {
  thunkAPI.dispatch(loadDataFromSessionStorage());
}
*/
