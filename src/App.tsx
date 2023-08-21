import './App.css';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { RootState } from './app/store';
import { saveInput, findGrammarMistakes } from './features/article/articleSlice';
import { ArticleDisplay } from './components/articleDisplay';

function App() {
	let defaultString = `A voiced consonant (or sound) means that it uses the vocal cords and they produce a vibration or humming sound in the throat when they are said. Put your finger on your throat and then pronounce the letter L. You will notice a slight vibration in your neck / throat. That is because it is a voiced sound.`;

	let [userInput, setUserInput] = useState(defaultString);
	let dispatch = useAppDispatch();
	let editStatus = useAppSelector((state: RootState) => state.article.status);

	return (
		<section className='user-input'>
			{editStatus === 'editing' ? (
				<>
					<textarea className='textarea' value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus />
					<button
						onClick={() => {
							dispatch(saveInput(userInput));
							dispatch(findGrammarMistakes(userInput));
						}}
					>
						Done
					</button>
				</>
			) : (
				<ArticleDisplay />
			)}
		</section>
	);
}

export default App;

/**
 * when adjustments evaluation done, click the paragraph enter edit mode
 * when edited, redo the findGrammarMistakes action
 * multi paragraph handle: check grammar mistakes per paragraph
 */
