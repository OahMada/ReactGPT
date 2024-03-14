import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../styled/button';

export var EmptyParagraphList = () => {
	let navigate = useNavigate();

	return (
		<StyledDiv>
			<div className='wrapper'>
				<h1>No Content Yet, Create New?</h1>
				<Button
					onClick={() => {
						navigate('/');
						toast.dismiss(); // dismiss any displaying toasts
					}}
				>
					Create
				</Button>
			</div>
		</StyledDiv>
	);
};

var StyledDiv = styled.div`
	display: grid;
	height: 100%;
	justify-content: center;
	padding-top: 50px;
	border: 1px solid var(--color-darker);
	border-radius: var(--border-radius);

	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	button {
		width: fit-content;
		margin-top: 20px;
	}
`;
