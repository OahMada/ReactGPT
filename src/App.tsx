import './App.css';
// toast css
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer } from 'react-toastify';

import { ArticleDisplay } from './components/articleDisplay';

function App() {
	return (
		<section className='app'>
			<ArticleDisplay />
			<ToastContainer limit={3} />
		</section>
	);
}

export default App;

/**
 * it's still possible to insert double line feeds. find a better way.
 * done an empty paragraph delete it
 * modal dynamic position props
 * Undo button on a toast for paragraph deletion action.
 * word suggestion react-autosuggest
 * show fix inline or separately
 * show last changes only or show changes from beginning
 * react router
 * react-hotkeys
 * export as pdf doc etc
 * component extraction
 */
