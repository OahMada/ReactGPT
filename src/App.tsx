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
 * Undo button on a toast for paragraph deletion action.
 * word suggestion react-autosuggest
 * show fix inline or separately
 * show last changes only or show changes from beginning
 * react router: switch paragraphs
 * react-hotkeys
 * export as pdf doc etc
 * test
 * rethought html layout and css
 * accept user input opaiAPI key and encrypt the key save to local-storage
 * modal dynamic position props
 * component extraction
 * sanitize user input
 */
