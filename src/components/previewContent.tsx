import { forwardRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { PartialParagraph } from '../types';
import { PreviewTranslation } from './previewTranslation';

interface Props {
	paragraph: PartialParagraph;
	includeTranslation: boolean;
}

type Ref = HTMLDivElement;

export var PreviewContent = forwardRef<Ref, Props>(({ paragraph, includeTranslation }, ref) => {
	let { reset } = useQueryErrorResetBoundary();
	return (
		<>
			<p>{paragraph.paragraphText}</p>
			{includeTranslation && (
				<ErrorBoundary
					onReset={reset}
					fallbackRender={({ resetErrorBoundary }) => {
						return (
							<div ref={ref}>
								<p>Error Occurred</p>
								<button onClick={() => resetErrorBoundary()}>Retry</button>
							</div>
						);
					}}
				>
					<PreviewTranslation includeTranslation={includeTranslation} paragraph={paragraph} />
				</ErrorBoundary>
			)}
		</>
	);
});
