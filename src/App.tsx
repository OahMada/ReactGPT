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
 * multi paragraph handle: check grammar mistakes per paragraph
 * what if I want to delete one paragraph: a dedicated delete button
 */
