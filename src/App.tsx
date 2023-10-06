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
 * refetch when click on find grammar mistakes button
 * textarea auto-resize
 * word suggestion react-autosuggest
 * component extraction
 * show fix inline or separately
 * show last changes only or show changes from beginning
 * react router
 * done an empty paragraph delete it
 * react-hotkeys
 * export as pdf doc etc
 */
