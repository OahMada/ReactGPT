import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query';

import { PreviewContent } from '../components';
import { PartialParagraph, Paragraph } from '../types';
import { useAppDispatch } from '../redux/hooks';
import { toggleTranslation } from '../features/articleSlice';
import { translationQueryKeys } from '../query/translationQuery';

export var Preview = () => {
	let [includeTranslation, setIncludeTranslation] = useState(false);

	let dispatch = useAppDispatch();

	let filteredParagraphs = useOutletContext<Paragraph[]>();
	let navigate = useNavigate();

	let queryClient = useQueryClient();
	let { reset } = useQueryErrorResetBoundary();

	let currentArticleParagraphs: PartialParagraph[] = filteredParagraphs.map((paragraph) => {
		return { paragraphText: paragraph.paragraphAfterGrammarFix || paragraph.paragraphBeforeGrammarFix, paragraphId: paragraph.id };
	});

	// with this, when canceling translation queries,paragraph translations that are ongoing fetching on article page will be set to hide
	let toggleShownParagraphTranslation = () => {
		filteredParagraphs.forEach((paragraph) => {
			if (
				paragraph.showTranslation &&
				queryClient.isFetching({ queryKey: translationQueryKeys(paragraph.paragraphAfterGrammarFix, paragraph.id) }) > 0
			) {
				dispatch(toggleTranslation(paragraph.id));
			}
		});
	};

	return (
		<ModalWrapper
			onClick={() => {
				navigate(-1);
			}}
		>
			<div onClick={(e) => e.stopPropagation()} className='paragraphs'>
				<div className='btn-container'>
					<button
						onClick={() => {
							setIncludeTranslation(!includeTranslation);
							if (includeTranslation) {
								toggleShownParagraphTranslation();
								// only run when hide preview translation
								queryClient.cancelQueries({ queryKey: ['translation'] });
								reset();
							}
						}}
					>
						{!includeTranslation ? 'Include Translation' : 'Remove Translation'}
					</button>
					<button
						onClick={() => {
							navigate(-1);
							if (includeTranslation) {
								toggleShownParagraphTranslation();
								queryClient.cancelQueries({ queryKey: ['translation'] });
								reset();
							}
						}}
					>
						Close
					</button>
				</div>

				{currentArticleParagraphs.map((paragraph) => {
					return <PreviewContent key={paragraph.paragraphId} paragraph={paragraph} includeTranslation={includeTranslation} />;
				})}
			</div>
		</ModalWrapper>
	);
};

var ModalWrapper = styled.section`
	width: 100vw;
	height: 100vh;
	display: grid;
	justify-items: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.8);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 250;
	transition: all 0.3s;

	.paragraphs {
		position: relative;
		width: 60%;
		min-height: 60%;
		background-color: #fff;
		box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		border-radius: 3px;
		overflow-y: scroll;
		transition: all 0.4s 0.2s;
		padding: 3rem;

		article:not(:last-child) {
			margin-bottom: 2rem;
		}

		p {
			font-size: 1.6rem;
		}

		p:not(:last-child) {
			margin-bottom: 0.8rem;
		}

		.btn-container {
			margin-bottom: 1rem;
		}
	}
`;
