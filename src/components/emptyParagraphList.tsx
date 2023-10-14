import { useAppDispatch } from '../app/hooks';
import { reEnterArticle } from '../features/articleSlice';

var EmptyParagraphList = () => {
	let dispatch = useAppDispatch();

	return (
		<div>
			<h1>No Content Yet, Create New?</h1>
			<button onClick={() => dispatch(reEnterArticle())}>Edit</button>
		</div>
	);
};
export default EmptyParagraphList;
