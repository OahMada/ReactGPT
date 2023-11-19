import styled from 'styled-components';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';

import { throwIfUndefined } from '../utils';
import { Paragraph } from '../features/articleSlice';
import { ArticlePreviewControlBtns } from '../components';

export var Preview = () => {
	let filteredParagraphs = useOutletContext<Paragraph[]>();
	let navigate = useNavigate();
	let { articleId } = useParams();
	throwIfUndefined(articleId);

	return (
		<ModalWrapper
			onClick={() => {
				navigate(-1);
			}}
		>
			<div onClick={(e) => e.stopPropagation()} className='paragraphs'>
				<ArticlePreviewControlBtns />

				{filteredParagraphs.map((paragraph) => {
					return <p key={paragraph.id}>{paragraph.paragraphAfterGrammarFix || paragraph.paragraphBeforeGrammarFix}</p>;
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

		p {
			font-size: 1.6rem;
			margin-bottom: 2rem;
		}

		p:last-child {
			margin-bottom: 0;
		}
	}
`;
