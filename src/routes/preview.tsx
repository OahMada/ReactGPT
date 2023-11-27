import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient, useIsFetching, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { usePDF } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale

import { PreviewContent, ArticlePDF } from '../components';
import { PartialParagraph, Paragraph } from '../types';
import { translationQueryKeys } from '../query/translationQuery';

export var Preview = () => {
	let [includeTranslation, setIncludeTranslation] = useState(false);
	let [showRetryAllButton, setShowRetryAllButton] = useState(false);

	let filteredParagraphs = useOutletContext<Paragraph[]>();
	let navigate = useNavigate();

	let queryClient = useQueryClient();
	let { reset } = useQueryErrorResetBoundary();
	let errorBoundaryFallbackElementCount = useRef(0);
	let resetErrorBoundariesMapRef = useRef(new Map());

	let currentArticleParagraphs: PartialParagraph[] = filteredParagraphs.map((paragraph) => {
		return { paragraphText: paragraph.paragraphAfterGrammarFix || paragraph.paragraphBeforeGrammarFix, paragraphId: paragraph.id };
	});

	// include translation into data for PDF generation
	let currentArticleParagraphsWithTranslation = currentArticleParagraphs.map((paragraph) => {
		let translation = queryClient.getQueryData<string>(translationQueryKeys(paragraph.paragraphText, paragraph.paragraphId));
		return Object.assign({}, paragraph, { translationText: translation ?? '' });
	});

	// initially generate PDF with only source article text
	let [PDFInstance, updatePDFInstance] = usePDF({ document: ArticlePDF({ article: currentArticleParagraphsWithTranslation, includeTranslation }) });

	// to add a retry all button when there's more than one sentences failed to request grammar fixes
	let translationFetchingCount = useIsFetching({ queryKey: ['translation'] });
	useEffect(() => {
		if (translationFetchingCount === 0) {
			if (errorBoundaryFallbackElementCount.current! > 1) {
				setShowRetryAllButton(true);
			} else if (errorBoundaryFallbackElementCount.current! <= 1) {
				setShowRetryAllButton(false);
			}
		}
	}, [translationFetchingCount]);

	// for disabling scrolling beneath the modal
	// https://blog.logrocket.com/building-react-modal-module-with-react-router/#preventing-scroll-underneath-modal
	let modalRef = useRef(null);
	useEffect(() => {
		let observerRefValue = modalRef.current;
		if (observerRefValue) {
			disableBodyScroll(observerRefValue);
		}
		return () => {
			if (observerRefValue) {
				enableBodyScroll(observerRefValue);
			}
		};
	}, []);

	// include translation into PDF when available
	useEffect(() => {
		if (translationFetchingCount === 0) {
			updatePDFInstance(ArticlePDF({ article: currentArticleParagraphsWithTranslation, includeTranslation }));
		}
	}, [updatePDFInstance, includeTranslation, translationFetchingCount, currentArticleParagraphsWithTranslation]);

	return (
		<ModalWrapper
			onClick={() => {
				navigate(-1);
			}}
			ref={modalRef}
		>
			<div onClick={(e) => e.stopPropagation()} className='paragraphs'>
				<div className='btn-container'>
					<button
						onClick={() => {
							setIncludeTranslation(!includeTranslation);
							if (includeTranslation) {
								setShowRetryAllButton(false);
								// only run when hide preview translation
								queryClient.cancelQueries({ queryKey: ['translation'] });
								reset();
							}
						}}
					>
						{!includeTranslation ? 'Include Translation' : 'Remove Translation'}
					</button>
					{showRetryAllButton && (
						<button
							onClick={() => {
								// order matters, you have to first `reset()`
								reset();
								resetErrorBoundariesMapRef.current.forEach((resetter) => {
									resetter();
								});
							}}
							disabled={translationFetchingCount > 0}
						>
							Retry All
						</button>
					)}
					<button
						onClick={() => {
							navigate(-1);
							if (includeTranslation) {
								queryClient.cancelQueries({ queryKey: ['translation'] });
								reset();
							}
						}}
					>
						Close
					</button>
				</div>
				<div>
					<button disabled={translationFetchingCount !== 0}>
						{translationFetchingCount === 0 ? (
							// since a tag doesn't have a disabled attribute
							<a href={PDFInstance.url!} download={`${dayjs(Date.now()).format('YYYY-MM-DDTHHmmss')}.pdf`}>
								Download PDF
							</a>
						) : (
							'Download PDF'
						)}
					</button>
				</div>

				{currentArticleParagraphs.map((paragraph) => {
					return (
						<PreviewContent
							key={paragraph.paragraphId}
							paragraph={paragraph}
							includeTranslation={includeTranslation}
							resetErrorBoundariesMapRef={resetErrorBoundariesMapRef.current} // to pass date from Child component https://medium.com/@bhuvan.gandhi/pass-data-from-child-component-to-parent-component-without-using-state-hook-b301a319b174#f7d6
							ref={(node) => {
								if (node) {
									errorBoundaryFallbackElementCount.current += 1;
								} else {
									errorBoundaryFallbackElementCount.current -= 1;
								}
							}}
						/>
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
		max-height: 80%;
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
