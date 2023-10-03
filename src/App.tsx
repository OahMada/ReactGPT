import './App.css';
// toast css
import 'react-toastify/dist/ReactToastify.min.css';

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
 * use styled component rather than css module
 * a grab handle for drag and drop
 * textarea auto-resize
 * word suggestion
 * component extraction
 * show fix inline or separately
 * show last changes only or show changes from beginning
 * react router
 * react-beautiful-dnd
 * react-autosuggest
 * react-hotkeys
 * done an empty paragraph delete it
 */
