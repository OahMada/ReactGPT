import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../styles';

export var EmptyParagraphList = () => {
	let navigate = useNavigate();

	return (
		<StyledDiv>
			<h1>No Content Yet, Create New?</h1>
			<Button
				onClick={() => {
					navigate('/');
					toast.dismiss(); // dismiss any displaying toasts
				}}
			>
				Create
			</Button>
		</StyledDiv>
	);
};

var StyledDiv = styled.div`
	display: grid;
	padding: 50px 0;
	border: 1px solid var(--color-darkest);
	border-radius: var(--border-radius);
	place-items: center;

	button {
		margin-top: 20px;
	}
`;
