import './App.css';
import { ArticleDisplay } from './components/articleDisplay';

function App() {
	return (
		<section className='app'>
			<ArticleDisplay />
		</section>
	);
}

export default App;

/**
 * what if I want to delete one paragraph: a dedicated delete button, also add new paragraph button
 * use styled component rather than css module
 * redux-persist
 */
