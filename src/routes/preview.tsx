import styled from 'styled-components';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useState } from 'react';

import { throwIfUndefined } from '../utils';
import { Paragraph } from '../features/articleSlice';
import { useTranslationQueries } from '../query/translationQuery';

export var Preview = () => {
	let [includeTranslation, setIncludeTranslation] = useState(false);
	let filteredParagraphs = useOutletContext<Paragraph[]>();
	let navigate = useNavigate();
	let { articleId } = useParams();
	throwIfUndefined(articleId);

	let paragraphQueries = filteredParagraphs.map((paragraph) => {
		return { paragraphText: paragraph.paragraphAfterGrammarFix || paragraph.paragraphBeforeGrammarFix, paragraphId: paragraph.id };
	});

	let result = useTranslationQueries(paragraphQueries, includeTranslation);

	let translationText = result.reduce<string[]>((acc, queryResult) => {
		if (queryResult.isFetching) {
			acc.push('Loading...');
		} else if (queryResult.data) {
			acc.push(queryResult.data);
		}
		return acc;
	}, []);

	return (
		<ModalWrapper
			onClick={() => {
				navigate(-1);
			}}
		>
			<div onClick={(e) => e.stopPropagation()} className='paragraphs'>
				<div className='btn-container'>
					<button onClick={() => setIncludeTranslation(!includeTranslation)}>
						{!includeTranslation ? 'Include Translation' : 'Remove Translation'}
					</button>
					<button onClick={() => navigate(-1)}>Close</button>
				</div>

				{filteredParagraphs.map((paragraph, index) => {
					return (
						<article key={paragraph.id}>
							<p>{paragraph.paragraphAfterGrammarFix || paragraph.paragraphBeforeGrammarFix}</p>
							{includeTranslation && <p>{translationText[index]}</p>}
						</article>
					);
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
