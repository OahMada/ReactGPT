import { useNavigate, createSearchParams, useSearchParams } from 'react-router-dom';

export var useNavigateWithSearchParams = () => {
	let [searchParams] = useSearchParams();
	let query = searchParams.get('search');
	let navigate = useNavigate();

	// https://stackoverflow.com/questions/65800658/react-router-v6-navigate-to-a-url-with-searchparams
	return (path: string) => {
		if (query) {
			/* v8 ignore next 6 */
			navigate({
				pathname: path,
				search: `?${createSearchParams({
					search: query,
				})}`,
			});
		} else {
			navigate(path);
		}
	};
};
