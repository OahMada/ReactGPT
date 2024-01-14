// components
import { Root, Article, ArticleInput, Config, ErrorPage, Preview, HotkeyMap } from './routes';

export var routesConfig = [
	{
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Root />,
				children: [
					{
						errorElement: <ErrorPage />,
						children: [
							{ index: true, element: <ArticleInput /> },
							{
								path: 'article/:articleId',
								element: <Article />,
								children: [
									{
										path: 'preview',
										element: <Preview />,
									},
								],
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
