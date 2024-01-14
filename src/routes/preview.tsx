import { useNavigate, useOutletContext } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient, useIsFetching, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // import locale
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';
import { proxy } from 'comlink';
import styled from 'styled-components';

import { PreviewContent, articleDocx } from '../components';
import { PartialParagraph, Paragraph } from '../types';
import { translationQueryKeys } from '../query/translationQuery';
import { createToast, useKeys, HotkeyMapData } from '../utils';
import { workerInstance } from '../worker/workerInstance';

export var Preview = () => {
	let [includeTranslation, setIncludeTranslation] = useState(false);
	let [showRetryAllButton, setShowRetryAllButton] = useState(false);
	let [showExportOptions, setShowExportOptions] = useState(false);
	let articleWrapperRef = useRef(null);

	// react router
	let filteredParagraphs = useOutletContext<Paragraph[]>();
	let navigate = useNavigate();

	let queryClient = useQueryClient();

	/* calculate necessary values */
	let currentArticleParagraphs: PartialParagraph[] = filteredParagraphs.map((paragraph) => {
		return { paragraphText: paragraph.paragraphAfterGrammarFix || paragraph.paragraphBeforeGrammarFix, paragraphId: paragraph.id };
	});

	let fileName = dayjs(Date.now()).format('YYYY-MM-DDTHHmmss');
	// include translation into data for file generation
	let currentArticleParagraphsWithTranslation = currentArticleParagraphs.map((paragraph) => {
		let translation = queryClient.getQueryData<string>(translationQueryKeys(paragraph.paragraphText, paragraph.paragraphId));
		return Object.assign({}, paragraph, { translationText: translation ?? '' });
	});

	/* Translation Retry Logic */
	let { reset } = useQueryErrorResetBoundary();
	let errorBoundaryFallbackElementCount = useRef(0);
	let resetErrorBoundariesMapRef = useRef(new Map());
	// to add a retry all button when there's more than one sentences failed to request grammar fixes
	let translationFetchingCount = useIsFetching({ queryKey: ['translation'] });

	let handleRetryAll = () => {
		// order matters, you have to first `reset()`
		reset();
		resetErrorBoundariesMapRef.current.forEach((resetter) => {
			resetter();
		});
	};

	let handleTranslation = () => {
		setIncludeTranslation(!includeTranslation);
		if (includeTranslation) {
			setShowRetryAllButton(false);
			// only run when hide preview translation
			queryClient.cancelQueries({ queryKey: ['translation'] });
			reset();
		}
	};

	let handleClosePreview = () => {
		navigate(-1);
		if (includeTranslation) {
			queryClient.cancelQueries({ queryKey: ['translation'] });
			reset();
		}
	};

	useEffect(() => {
		if (translationFetchingCount === 0) {
			if (errorBoundaryFallbackElementCount.current! > 1) {
				setShowRetryAllButton(true);
			} else if (errorBoundaryFallbackElementCount.current! <= 1) {
				setShowRetryAllButton(false);
			}
		}
	}, [translationFetchingCount]);

	/* for disabling scrolling beneath the modal */
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

	/* Image Generation */
	let downloadImg = async () => {
		// a bug from the library: Error inlining remote css file DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules
		await workerInstance.exportFile(
			proxy(() => {
				toBlob(articleWrapperRef.current!, { backgroundColor: 'white' }).then(function (blob) {
					let b = blob as Blob;
					if (window.saveAs) {
						window.saveAs(b, `${fileName}.png`);
					} else {
						saveAs(b, `${fileName}.png`);
					}
				});
			})
		);
		createToast({ type: 'info', content: 'Downloading Image...', toastId: 'downloadImg', options: { autoClose: 500, closeButton: false } });
	};

	let debouncedDownloadImg = debounce(downloadImg, 500, { leading: true, trailing: false });

	/* PDF Generation */
	let downloadPDF = async () => {
		// https://dev.to/jringeisen/using-jspdf-html2canvas-and-vue-to-generate-pdfs-1f8l
		await workerInstance.exportFile(
			proxy(() => {
				let doc = new jsPDF({
					orientation: 'p',
					unit: 'px',
					format: 'a4',
					hotfixes: ['px_scaling'],
				});

				html2canvas(articleWrapperRef.current!, {
					width: doc.internal.pageSize.getWidth(),
					height: doc.internal.pageSize.getHeight(),
				}).then((canvas) => {
					let img = canvas.toDataURL('image/png');
					doc.addImage(img, 'PNG', 30, 10, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
					doc.save(`${fileName}.pdf`);
				});
			})
		);

		createToast({ type: 'info', content: 'Downloading PDF...', toastId: 'downloadPDF', options: { autoClose: 500, closeButton: false } });
	};
	let debouncedDownloadPDF = debounce(downloadPDF, 500, { leading: true, trailing: false });

	/* DOCX Generation */
	let downloadDocx = async () => {
		await workerInstance.exportFile(
			proxy(() => {
				Packer.toBlob(articleDocx({ article: currentArticleParagraphsWithTranslation, includeTranslation })).then((blob) => {
					if (window.saveAs) {
						window.saveAs(blob, `${fileName}.docx`);
					} else {
						saveAs(blob, `${fileName}.docx`);
					}
				});
			})
		);
		createToast({ type: 'info', content: 'Downloading DOCX...', toastId: 'downloadDOCX', options: { autoClose: 500, closeButton: false } });
	};

	let debouncedDownloadDocx = debounce(downloadDocx, 500, { leading: true, trailing: false });

	/* Copy to Clipboard */
	let copyToClipboard = () => {
		let clipboardText = currentArticleParagraphsWithTranslation.reduce<string>((acc, paragraph) => {
			acc += paragraph.paragraphText;
			acc += '\n\n';
			if (paragraph.translationText) {
				acc += paragraph.translationText;
				acc += '\n\n';
			}
			return acc;
		}, '');
		// https://stackoverflow.com/questions/39501289/in-reactjs-how-to-copy-text-to-clipboard
		navigator.clipboard.writeText(clipboardText);

		createToast({ type: 'info', content: 'Copied to Clipboard', toastId: 'copyToClipboard', options: { autoClose: 500, closeButton: false } });
	};

	let debouncedCopyToClipboard = debounce(copyToClipboard, 500, { leading: true, trailing: false });

	/* Hotkeys */
	let { 'Preview Page': previewPageHotkeys } = HotkeyMapData();

	useKeys({ keyBinding: previewPageHotkeys.includeTranslation.hotkey, callback: handleTranslation });
	useKeys({ keyBinding: previewPageHotkeys.exitPreview.hotkey, callback: handleClosePreview });
	useKeys({ keyBinding: previewPageHotkeys.copyToClipboard.hotkey, callback: debouncedCopyToClipboard });
	useKeys({
		keyBinding: previewPageHotkeys.showExportOptions.hotkey,
		callback: () => {
			setShowExportOptions(true);
		},
	});
	useKeys({ keyBinding: previewPageHotkeys.downloadPDF.hotkey, callback: debouncedDownloadPDF });
	useKeys({ keyBinding: previewPageHotkeys.downloadDocx.hotkey, callback: debouncedDownloadDocx });
	useKeys({ keyBinding: previewPageHotkeys.downloadImg.hotkey, callback: debouncedDownloadImg });
	useKeys({ keyBinding: previewPageHotkeys.retryAllErred.hotkey, callback: handleRetryAll });

	return (
		<ModalWrapper
			onClick={() => {
				navigate(-1);
			}}
			ref={modalRef}
		>
			<div onClick={(e) => e.stopPropagation()} className='paragraphs'>
				<div className='btn-container'>
					<button onClick={handleTranslation} data-tooltip-id='hotkey' data-tooltip-content={previewPageHotkeys.includeTranslation.label}>
						{!includeTranslation ? 'Include Translation' : 'Remove Translation'}
					</button>
					{showRetryAllButton && (
						<button
							onClick={handleRetryAll}
							disabled={translationFetchingCount > 0}
							data-tooltip-id='hotkey'
							data-tooltip-content={previewPageHotkeys.retryAllErred.label}
						>
							Retry All
						</button>
					)}
					<button onClick={handleClosePreview} data-tooltip-id='hotkey' data-tooltip-content={previewPageHotkeys.exitPreview.label}>
						Close
					</button>
				</div>
				<div>
					<button
						disabled={translationFetchingCount !== 0}
						onClick={debouncedCopyToClipboard}
						data-tooltip-id='hotkey'
						data-tooltip-content={previewPageHotkeys.copyToClipboard.label}
					>
						Copy To Clipboard
					</button>
					{showExportOptions ? (
						<>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedDownloadPDF}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.downloadPDF.label}
							>
								Download PDF
							</button>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedDownloadDocx}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.downloadDocx.label}
							>
								Download DOCX
							</button>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedDownloadImg}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.downloadImg.label}
							>
								Download Image
							</button>
						</>
					) : (
						<button
							onClick={() => setShowExportOptions(true)}
							data-tooltip-id='hotkey'
							data-tooltip-content={previewPageHotkeys.showExportOptions.label}
						>
							Export As File
						</button>
					)}
				</div>
				<div ref={articleWrapperRef} className='article-display'>
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

		.article-display {
			padding: 2rem;
		}
	}
`;
