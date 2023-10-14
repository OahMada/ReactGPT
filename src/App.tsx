import './App.css';
// toast css
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { ArticleDisplay } from './components/articleDisplay';

function App() {
	return (
		<section className='app'>
			<ArticleDisplay />
			<ToastContainer enableMultiContainer containerId={'paragraphDeletion'} closeOnClick={false} closeButton={false} />
			<ToastContainer limit={3} enableMultiContainer />
		</section>
	);
}

export default App;

/**
 * there might be empty queryGPT result?
 * when all paragraphs deleted, display empty textarea
 * when the last paragraph is undertaking deletion, display some fill in text
 * pass in custom toast option to createToast
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
