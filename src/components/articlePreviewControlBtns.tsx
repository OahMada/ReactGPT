import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export var ArticlePreviewControlBtns = () => {
	let navigate = useNavigate();
	return (
		<Wrapper>
			<button>Include Translation</button>
			<button onClick={() => navigate(-1)}>Close</button>
		</Wrapper>
	);
};

let Wrapper = styled.div`
	margin-bottom: 1rem;
`;
