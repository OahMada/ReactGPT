import { Outlet, Link } from 'react-router-dom';

export default function Root() {
	return (
		<>
			<nav>
				<ul>
					<li>
						<Link to={`article/1`}>article1</Link>
					</li>
				</ul>
			</nav>
			<div id='detail'>
				<Outlet />
			</div>
		</>
	);
}
