import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { PartialParagraph } from '../types';
import { PreviewTranslation } from './previewTranslation';

export var PreviewContent = ({ paragraph, includeTranslation }: { paragraph: PartialParagraph; includeTranslation: boolean }) => {
	let { reset } = useQueryErrorResetBoundary();

	return (
		<>
			<p>{paragraph.paragraphText}</p>
			{includeTranslation && (
				<ErrorBoundary
					onReset={reset}
					fallbackRender={({ resetErrorBoundary }) => {
						return (
							<>
								<p>Error Occurred</p>
								<button onClick={() => resetErrorBoundary()}>Retry</button>
							</>
						);
					}}
				>
					<PreviewTranslation includeTranslation={includeTranslation} paragraph={paragraph} />
				</ErrorBoundary>
			)}
		</>
	);
};
