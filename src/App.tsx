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
 * a grab handle for drag and drop react-beautiful-dnd
 * textarea auto-resize
 * word suggestion react-autosuggest
 * component extraction
 * show fix inline or separately
 * show last changes only or show changes from beginning
 * react router
 * done an empty paragraph delete it
 * react-hotkeys
 */
