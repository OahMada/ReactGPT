// components
import { Root, Article, ArticleInput, Config, ErrorPage, Preview, HotkeyMap } from './routes';
// import { ReactPortal } from './components';
import { FocusedParagraphIndexContextWrapper } from './components';

var routesConfig = [
	{
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Root />,
				children: [
					{
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
							{
								path: 'articles',
							},
						],
					},
				],
			},
			{
				path: 'config',
				element: <Config />,
			},
			{
				path: 'hotkey',
				element: <HotkeyMap />,
			},
		],
	},
];

export default routesConfig;
