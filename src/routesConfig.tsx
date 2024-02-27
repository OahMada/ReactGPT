// components
import { Root, Article, ArticleInput, Config, ErrorPage, Preview, HotkeyMap } from './routes';
// import { ReactPortal } from './components';
import { FocusedParagraphIndexContextWrapper, SharedLayout } from './components';

var routesConfig = [
	{
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Root />,
				children: [
					{
						element: <SharedLayout />,
						children: [
							{ index: true, element: <ArticleInput /> },
							{
								path: 'article/:articleId',
								element: (
									<FocusedParagraphIndexContextWrapper>
										<Article />
									</FocusedParagraphIndexContextWrapper>
								),
								children: [
									{
										path: 'preview',
										element: (
											// <ReactPortal>
											<Preview />
											// </ReactPortal>
										),
									},
								],
							},
						],
					},
					{
						path: 'hotkey',
						element: <HotkeyMap />,
					},
				],
			},
			{
				path: 'config',
				element: <Config />,
			},
		],
	},
];

export default routesConfig;
