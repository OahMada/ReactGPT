import { useState } from 'react';
import { useNavigateWithSearchParams } from '../utils';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale
import cs from 'classnames';
import styled from 'styled-components';
import { RiStarSFill } from 'react-icons/ri';
import { RxArrowRight } from 'react-icons/rx';
import { useWindowSize } from 'react-use';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { removeArticle, addArticleToDeletionQueue, removeArticleFromDeletionQueue, selectArticle } from '../features/articleSlice';
import { Button } from '../styled/button';
import { useFocusedParagraphIndexContext } from '../components';

interface ArticleCardProp {
	article: {
		articleId: string;
		articleText: string;
		editDate: number;
	};
	articleIsInFavorites: boolean;
	articlePinningScheduleRef: Map<string, 'pin' | 'unpin'>;
	setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export var ArticleCard = ({ article, articleIsInFavorites, articlePinningScheduleRef, setShowMenu }: ArticleCardProp) => {
	let { width: windowWidth } = useWindowSize();
	let { paragraphs } = useAppSelector(selectArticle);

	let paragraphsInArticle = paragraphs.map((paragraph) => {
		if (paragraph.articleId === article.articleId) {
			return paragraph.id;
		}
	});

	dayjs.locale('zh-cn');
	let [pinning, setPinning] = useState(articleIsInFavorites);

	// to sync state with prop https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	let [prevArticleIsInFavorites, setPrevArticleIsInFavorites] = useState(articleIsInFavorites);
	if (articleIsInFavorites !== prevArticleIsInFavorites) {
		setPrevArticleIsInFavorites(articleIsInFavorites);
		setPinning(articleIsInFavorites);
	}

	if (pinning !== articleIsInFavorites) {
		articlePinningScheduleRef.set(article.articleId, pinning ? 'pin' : 'unpin');
	} else {
		articlePinningScheduleRef.delete(article.articleId);
	}

	let navigateWithSearchParams = useNavigateWithSearchParams();
	let navigate = useNavigate();
	let dispatch = useAppDispatch();
	const { articleId: currentArticle } = useParams();

	let focusedParagraphIndexRef = useFocusedParagraphIndexContext();

	let navigateToAnotherArticle = () => {
		navigateWithSearchParams(`article/${article.articleId}`);
		// reset focus on navigating away
		focusedParagraphIndexRef.current = -1;
	};

	return (
		<ArticleCardWrapper $isPinned={pinning} key={article.articleId} className={cs('card', { active: article.articleId === currentArticle })}>
			{pinning && (
				<div className='icon-wrapper'>
					<RiStarSFill />
				</div>
			)}
			<div
				onClick={() => {
					if (windowWidth > 750) {
						navigateToAnotherArticle();
					}
				}}
				className='card-content'
			>
				{windowWidth <= 750 ? (
					<>
						<div className='small-screen-text'>
							<p>{article.articleText}</p>
							<span>...</span>
						</div>
						<button
							className='go-to-article-btn'
							onTouchStart={() => {
								setTimeout(() => {
									navigateToAnotherArticle();
									setShowMenu(false);
								}, 300);
							}}
						>
							<span>Go to Article</span>&nbsp;
							<RxArrowRight />
						</button>
					</>
				) : (
					<p>{article.articleText.length > 35 ? article.articleText.slice(0, 35) + '...' : article.articleText}</p>
				)}
				<p className='date'>{dayjs(article.editDate).format('YYYY-MM-DD HH:mm:ss')}</p>
			</div>
			<div className='btn-container'>
				<Button
					onClick={() => {
						dispatch(addArticleToDeletionQueue(article.articleId));
						dispatch(removeArticle(article.articleId));
						// only navigate when the displaying article is deleted
						if (article.articleId === currentArticle) {
							navigate('/');
							setShowMenu(false);
						}
						dispatch(removeArticleFromDeletionQueue(article.articleId));
						// clear any probable ongoing paragraph deletion toast
						paragraphsInArticle.forEach((item) => {
							toast.dismiss(item);
						});
						toast.dismiss(article.articleId);
					}}
				>
					Delete
				</Button>
				<Button
					onClick={() => {
						// handel initial click
						setPinning(!pinning);
					}}
					onMouseLeave={(e) => e.currentTarget.blur()} // because clicking the pin/unpin button would focus the button element, thus the css rule &:focus-within .btn-container {} is applied. Remove focus so that the button can properly fade away.
				>
					{pinning ? 'Unpin' : 'Pin'}
				</Button>
			</div>
		</ArticleCardWrapper>
	);
};

var ArticleCardWrapper = styled.div<{ $isPinned: boolean }>`
	background-color: ${({ $isPinned }) => $isPinned && 'var(--color-light)'};

	.icon-wrapper {
		display: grid;
		height: calc(var(--font-small) * 1.5);
		flex-shrink: 0;
		align-self: flex-start;
		place-content: center;
	}

	.btn-container {
		position: absolute;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: var(--gap-primary);
		opacity: 0;
		transition:
			translate 0.5s,
			opacity 0.5s;
		transition-timing-function: ease-in;
		translate: 100%;
	}

	&:hover .btn-container
	/* https://stackoverflow.com/a/45674671/5800789 */
	, &:focus-within .btn-container {
		position: static;
		opacity: 1;
		transition-timing-function: ease-out;
		translate: none;
	}

	.card-content {
		display: flex;
		width: 70%;
		height: 100%;
		flex-direction: column;
		flex-grow: 1;
		justify-content: space-around;

		.small-screen-text {
			display: flex;

			p {
				overflow: hidden;
				white-space: nowrap;
			}
		}

		.go-to-article-btn {
			display: flex;
			height: var(--util-icon-container-dimension);
			align-items: center;
			align-self: flex-start;
			padding: 0;
			border: none;
			background-color: transparent;
			color: darkgray;
			font-style: italic;
		}
	}

	.date {
		color: grey;
		font-style: italic;
	}
`;
