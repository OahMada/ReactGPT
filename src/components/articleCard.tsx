import { useState } from 'react';
import { useNavigateWithSearchParams } from '../utils';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale

import { useAppDispatch } from '../redux/hooks';
import { removeArticle, addArticleToDeletionQueue, unPinArticle, pinArticle, removeArticleFromDeletionQueue } from '../features/articleSlice';
import styled, { css } from 'styled-components';

interface ArticleCardProp {
	article: {
		articleId: string;
		articleText: string;
		editDate: number;
	};
	articleIsInFavorites: boolean;
}

export var ArticleCard = ({ article, articleIsInFavorites }: ArticleCardProp) => {
	dayjs.locale('zh-cn');

	let [cardHoverState, setCardHoverState] = useState(false);
	let [pinning, setPinning] = useState(articleIsInFavorites);

	// to sync state with prop https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	let [prevArticleIsInFavorites, setPrevArticleIsInFavorites] = useState(articleIsInFavorites);
	if (articleIsInFavorites !== prevArticleIsInFavorites) {
		setPrevArticleIsInFavorites(articleIsInFavorites);
		setPinning(articleIsInFavorites);
	}

	let navigateWithSearchParams = useNavigateWithSearchParams();
	let navigate = useNavigate();
	let dispatch = useAppDispatch();
	const { articleId: currentArticle } = useParams();

	let resolvePinningAction = () => {
		if (articleIsInFavorites && !pinning) {
			dispatch(unPinArticle(article.articleId));
		} else if (!articleIsInFavorites && pinning) {
			dispatch(pinArticle(article.articleId));
		}
	};

	return (
		<StyledDiv
			$cardHover={cardHoverState}
			key={article.articleId}
			className='card'
			onMouseEnter={() => {
				setCardHoverState(true);
			}}
			onMouseLeave={() => {
				setCardHoverState(false);
				setTimeout(() => resolvePinningAction(), 500);
			}}
		>
			<div onClick={() => navigateWithSearchParams(`article/${article.articleId}`)} className='card-content'>
				<p>{article.articleText.length > 40 ? article.articleText.slice(0, 40) + '...' : article.articleText}</p>{' '}
				<p className='date'>{dayjs(article.editDate).format('YYYY-MM-DD THH:mm')}</p>
			</div>
			<div className='btn-container'>
				<button
					onClick={() => {
						dispatch(addArticleToDeletionQueue(article.articleId));
						dispatch(removeArticle(article.articleId));
						// only navigate when the displaying article is deleted
						if (article.articleId === currentArticle) {
							navigate('/');
						}
						dispatch(removeArticleFromDeletionQueue(article.articleId));
						toast.dismiss(`articleDeletion${article.articleId}`);
					}}
					className='btn'
				>
					Delete
				</button>
				<button
					onClick={() => {
						// handel initial click
						setPinning(!pinning);
					}}
					className='btn'
				>
					{pinning ? 'Unpin' : 'Pin'}
				</button>
			</div>
		</StyledDiv>
	);
};

var StyledDiv = styled.div<{ $cardHover: boolean }>`
	.btn-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition:
			translate 0.5s,
			opacity 0.5s;

		${({ $cardHover }) =>
			$cardHover
				? css`
						position: static;
						opacity: 1;
						translate: none;
					`
				: css`
						position: absolute;
						right: 0;
						opacity: 0;
						translate: 100%;
					`}

		.btn {
			border: none;
			border-radius: 1rem;
		}
	}

	.card-content {
		display: flex;
		height: 100%;
		flex: 1 1 auto;
		flex-direction: column;
		justify-content: space-between;
	}

	.date {
		color: grey;
		font-style: italic;
	}
`;
