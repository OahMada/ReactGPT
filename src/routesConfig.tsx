import { lazy, Suspense } from 'react';

// components
import { Root, Article, ArticleInput, Config, ErrorPage } from './routes';
import { Loading, ModalWrapper } from './components';

var HotkeyMap = lazy(() => import('./routes/hotkeyMap'));
var Preview = lazy(() => import('./routes/preview'));

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
										element: (
											<Suspense
												fallback={
													<ModalWrapper>
														<Loading />
													</ModalWrapper>
												}
											>
												<Preview />,
											</Suspense>
										),
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
				element: (
					<Suspense fallback={<Loading />}>
						<HotkeyMap />,
					</Suspense>
				),
			},
		],
	},
];
