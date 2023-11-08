import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

var EmptyParagraphList = () => {
	let navigate = useNavigate();

	return (
		<div>
			<h1>No Content Yet, Create New?</h1>
			<button
				onClick={() => {
					navigate('/');
					toast.dismiss(); // dismiss any displaying toasts
				}}
			>
				Create
			</button>
		</div>
	);
};
export default EmptyParagraphList;
