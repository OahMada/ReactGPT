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
 * a grab handle for drag and drop
 * prevent line break when edit paragraph
 * use styled component rather than css module
 * word suggestion
 */
