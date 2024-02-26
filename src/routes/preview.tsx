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
import { proxy } from 'comlink';
import styled from 'styled-components';
import { createFocusTrap } from 'focus-trap';

import { PreviewContent, articleDocx } from '../components';
import { PartialParagraph, Paragraph } from '../types';
import { translationQueryKeys } from '../query/translationQuery';
import { createToast, useKeys, HotkeyMapData, debounce } from '../utils';
import { workerInstance } from '../worker/workerInstance';
import { ControlOptionsMenuContainerStyles, ControlOptionsMenu } from '../styles';

export var Preview = () => {
	let [includeTranslation, setIncludeTranslation] = useState(false);
	let [showRetryAllButton, setShowRetryAllButton] = useState(false);
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

	// handle focus trap within the modal
	useEffect(() => {
		let focusTrap = createFocusTrap(modalRef.current!, { clickOutsideDeactivates: true, escapeDeactivates: false, initialFocus: false });
		focusTrap.activate();
		return () => {
			focusTrap.deactivate();
		};
	}, []);

	/* Image Generation */
	let downloadImg = async () => {
		// a bug from the library: Error inlining remote css file DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules
		/* v8 ignore next 13 */
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

	let debouncedDownloadImg = debounce(downloadImg, 500);

	/* PDF Generation */
	let downloadPDF = async () => {
		// https://dev.to/jringeisen/using-jspdf-html2canvas-and-vue-to-generate-pdfs-1f8l
		/* v8 ignore next 19 */
		await workerInstance.exportFile(
			proxy(() => {
				let pdf = new jsPDF({
					orientation: 'p',
					unit: 'px',
					format: 'a4',
					hotfixes: ['px_scaling'],
				});
				// credit https://stackoverflow.com/a/55497749/5800789
				html2canvas(articleWrapperRef.current!).then((canvas) => {
					let img = canvas.toDataURL('image/png');
					let imgProps = pdf.getImageProperties(img);
					let imgWidth = pdf.internal.pageSize.getWidth() * 0.9;
					let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
					pdf.addImage(img, 'PNG', 20, 20, imgWidth, imgHeight);
					pdf.save(`${fileName}.pdf`);
				});
			})
		);

		createToast({ type: 'info', content: 'Downloading PDF...', toastId: 'downloadPDF', options: { autoClose: 500, closeButton: false } });
	};
	let debouncedDownloadPDF = debounce(downloadPDF, 500);

	/* DOCX Generation */
	let downloadDocx = async () => {
		/* v8 ignore next 12 */
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

	let debouncedDownloadDocx = debounce(downloadDocx, 500);

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

		/* v8 ignore next */
		createToast({ type: 'info', content: 'Copied to Clipboard', toastId: 'copyToClipboard', options: { autoClose: 500, closeButton: false } });
	};

	let debouncedCopyToClipboard = debounce(copyToClipboard, 500);

	/* Hotkeys */
	let { 'Preview Page': previewPageHotkeys } = HotkeyMapData();

	useKeys({ keyBinding: previewPageHotkeys.includeTranslation.hotkey, callback: handleTranslation });
	useKeys({ keyBinding: previewPageHotkeys.exitPreview.hotkey, callback: handleClosePreview });
	useKeys({ keyBinding: previewPageHotkeys.copyToClipboard.hotkey, callback: debouncedCopyToClipboard });
	useKeys({ keyBinding: previewPageHotkeys.downloadPDF.hotkey, callback: debouncedDownloadPDF });
	useKeys({ keyBinding: previewPageHotkeys.downloadDocx.hotkey, callback: debouncedDownloadDocx });
	useKeys({ keyBinding: previewPageHotkeys.downloadImg.hotkey, callback: debouncedDownloadImg });
	useKeys({ keyBinding: previewPageHotkeys.retryAllErred.hotkey, callback: handleRetryAll });

	return (
		<StyledSection
			/* v8 ignore next 3 */
			onClick={() => {
				navigate(-1);
			}}
			ref={modalRef}
		>
			<div onClick={(e) => e.stopPropagation()} className='paragraphs'>
				<div className='preview-header'>
					<div className='btn-container'>
						<button onClick={handleClosePreview} data-tooltip-id='hotkey' data-tooltip-content={previewPageHotkeys.exitPreview.label} className='btn'>
							Close
						</button>
						<button
							onClick={handleTranslation}
							data-tooltip-id='hotkey'
							data-tooltip-content={previewPageHotkeys.includeTranslation.label}
							className='btn'
						>
							{!includeTranslation ? 'Include Translation' : 'Remove Translation'}
						</button>
						{showRetryAllButton && (
							<button
								onClick={handleRetryAll}
								disabled={translationFetchingCount > 0}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.retryAllErred.label}
								className='btn'
							>
								Retry All
							</button>
						)}
					</div>
					<div className='export-options-container'>
						<div className='btn-container'>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedCopyToClipboard}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.copyToClipboard.label}
								className='btn'
							>
								Copy To Clipboard
							</button>
							<button className='btn export-btn'>Export To File</button>
						</div>
						<StyledDiv className='export-options'>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedDownloadPDF}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.downloadPDF.label}
								className='btn'
							>
								Download PDF
							</button>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedDownloadDocx}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.downloadDocx.label}
								className='btn'
							>
								Download DOCX
							</button>
							<button
								disabled={translationFetchingCount !== 0}
								onClick={debouncedDownloadImg}
								data-tooltip-id='hotkey'
								data-tooltip-content={previewPageHotkeys.downloadImg.label}
								className='btn'
							>
								Download Image
							</button>
						</StyledDiv>
					</div>
				</div>
				<section ref={articleWrapperRef}>
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
				</section>
			</div>
		</StyledSection>
	);
};

var StyledSection = styled.section`
	position: fixed;
	top: 0;
	left: 0;
	display: grid;
	width: 100vw;
	height: 100dvh;
	background-color: rgb(0 0 0 / 80%);
	isolation: isolate;
	place-items: center center;

	button {
		border-color: var(--color-dark);
		background-color: var(--color-light);
	}

	.paragraphs {
		position: relative;
		display: flex;
		width: 70rem;
		min-height: 60%;
		max-height: 80%;
		flex-direction: column;
		border-radius: var(--border-radius-small);
		background-color: white;
		box-shadow: 0 2rem 4rem rgb(0 0 0 / 20%);
		overflow-y: scroll;

		.preview-header {
			position: fixed;
			display: flex;
			width: inherit;
			justify-content: space-between;
			padding: 30px;
			padding-bottom: 10px;
			border-radius: var(--border-radius-small);
			background-color: white;
		}

		.btn-container {
			display: flex;
			min-height: 30px;
			gap: var(--gap-primary);
		}

		.export-options-container {
			right: 30px;
			${ControlOptionsMenuContainerStyles}
		}

		section {
			flex-grow: 1;
			padding: 20px;
			border: 1px solid var(--color-dark);
			border-radius: var(--border-radius);
			margin: 30px;
			margin-top: 70px;

			p {
				font-size: var(--font-primary);
			}

			& > p:not(:last-child) {
				margin-bottom: 0.8rem;
			}
		}
	}
`;

var StyledDiv = styled(ControlOptionsMenu)`
	background-color: var(--color-light);
	box-shadow: 0 0 0.5rem rgb(0 0 0 / 60%);
	translate: 0 -1px;

	.btn-container:has(.export-btn:hover) + & {
		display: flex;
	}
`;
