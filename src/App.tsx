import './App.css';
import { useAppSelector } from './app/hooks';
import { selectArticle } from './features/article/articleSlice';
import { ArticleDisplay } from './components/articleDisplay';
import UserInput from './components/userInput';

function App() {
	let { status: editStatus } = useAppSelector(selectArticle);

	return <section className='user-input'>{editStatus === 'editing' ? <UserInput /> : <ArticleDisplay />}</section>;
}

export default App;

/**
 * multi paragraph handle: check grammar mistakes per paragraph
 * what if I want to delete one paragraph: a dedicated delete button
 */
