import { useState } from 'react';
import { useNavigateWithSearchParams } from '../utils';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale
import cs from 'classnames';

import { useAppDispatch } from '../redux/hooks';
import { removeArticle, addArticleToDeletionQueue, removeArticleFromDeletionQueue } from '../features/articleSlice';
import styled from 'styled-components';

interface ArticleCardProp {
	article: {
		articleId: string;
		articleText: string;
		editDate: number;
	};
	articleIsInFavorites: boolean;
	articlePinningScheduleRef: Map<string, 'pin' | 'unpin'>;
}

export var ArticleCard = ({ article, articleIsInFavorites, articlePinningScheduleRef }: ArticleCardProp) => {
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

	return (
		<StyledDiv $isPinned={pinning} key={article.articleId} className={cs('card', { active: article.articleId === currentArticle })}>
			<div onClick={() => navigateWithSearchParams(`article/${article.articleId}`)} className='card-content'>
				<p>{article.articleText.length > 35 ? article.articleText.slice(0, 35) + '...' : article.articleText}</p>{' '}
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

var StyledDiv = styled.div<{ $isPinned: boolean }>`
	background-color: ${({ $isPinned }) => $isPinned && 'var(--color-light)'};

	.btn-container {
		position: absolute;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		opacity: 0;
		transition:
			translate 0.5s,
			opacity 0.5s;
		transition-timing-function: ease-in;
		translate: 100%;
	}

	&:hover .btn-container {
		position: static;
		opacity: 1;
		transition-timing-function: ease-out;
		translate: none;
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
