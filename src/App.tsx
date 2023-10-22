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
 * click find grammar mistakes, and the old text is displayed, why?
 * pasted text gets split by double line feeds, and new paragraph automatically crated
 *
 * react router: switch paragraphs
 *
 * accept user input opaiAPI key and encrypt the key save to local-storage
 * a way to invoke hidden api key
 * change api key setting
 *
 * preview result
 *
 * export as pdf doc etc
 *
 * react-hotkeys
 * sanitize user input
 * test
 * rethought html layout and css
 * modal dynamic position props
 * update user flow
 * MUI
 */
