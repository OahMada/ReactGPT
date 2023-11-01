// toast css
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { ArticleDisplay } from '../components/articleDisplay';
import styled from 'styled-components';

function Article() {
	return (
		<StyledSection>
			<ArticleDisplay />
			<ToastContainer enableMultiContainer containerId={'paragraphDeletion'} closeOnClick={false} closeButton={false} />
			<ToastContainer limit={3} enableMultiContainer />
		</StyledSection>
	);
}

var StyledSection = styled.section`
	border: 1px solid #ccc;
	padding: 6rem;
	width: 100%;
	height: 80vh;
	position: relative;
`;

export default Article;

/**
 * react router: switch paragraphs
 * search, add new article, delete article, pin article
 * create article ID, form submit, and save id to state
 * https://bobbyhadz.com/blog/react-redirect-after-form-submit
 *
 * remove article.tsx maybe?
 *
 * accept user input opaiAPI key and encrypt the key save to local-storage
 * a way to invoke hidden default api key
 * change api key setting
 *
 * preview result
 * export as pdf doc etc, send to mail
 *
 * react-hotkeys
 * test
 *
 * update user flow
 *
 * rethought html layout and css
 * modal dynamic position props
 * MUI
 */
