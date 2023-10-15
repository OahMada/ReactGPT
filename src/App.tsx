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
 * word suggestion react-autosuggest
 * show fix inline or separately
 * show last changes only or show changes from beginning
 * react router: switch paragraphs
 * accept user input opaiAPI key and encrypt the key save to local-storage
 * react-hotkeys
 * export as pdf doc etc
 * sanitize user input
 * test
 * rethought html layout and css
 * modal dynamic position props
 * update user flow
 */
