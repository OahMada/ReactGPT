import { forwardRef, useEffect, useRef, Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useQueryErrorResetBoundary, useIsFetching } from '@tanstack/react-query';
import { mergeRefs } from 'react-merge-refs';
import styled from 'styled-components';

import { PartialParagraph } from '../types';
import { Loading, PreviewTranslation } from '.';
import { ErrorBoundaryWrapper, Button } from '../styles';

interface Props {
	paragraph: PartialParagraph;
	includeTranslation: boolean;
	resetErrorBoundariesMapRef: Map<string, FallbackProps['resetErrorBoundary']>;
}

type Ref = HTMLDivElement;

export var PreviewContent = forwardRef<Ref, Props>(({ paragraph, includeTranslation, resetErrorBoundariesMapRef }, ref) => {
	let fetchCount = useIsFetching({ queryKey: ['translation'] });
	let { reset } = useQueryErrorResetBoundary();

	let resetErrorBoundaryRef = useRef<FallbackProps['resetErrorBoundary'] | null>(null);

	useEffect(() => {
		if (fetchCount === 0) {
			// update parent useRef value
			if (resetErrorBoundaryRef.current) {
				resetErrorBoundariesMapRef.set(paragraph.paragraphId, resetErrorBoundaryRef.current);
			}
		}
	}, [fetchCount, paragraph.paragraphId, resetErrorBoundariesMapRef]);

	// For newly inserted paragraphs that do not have any saved content yet
	if (paragraph.paragraphText === '') {
		return;
	}

	return (
		<>
			<p>{paragraph.paragraphText}</p>
			{includeTranslation && (
				<ErrorBoundary
					onReset={reset}
					fallbackRender={({ resetErrorBoundary }) => {
						return (
							<StyledDiv ref={mergeRefs([() => (resetErrorBoundaryRef.current = resetErrorBoundary), ref])}>
								<p>
									<i>Error Occurred!</i>
								</p>
								<Button onClick={() => resetErrorBoundary()}>Retry</Button>
							</StyledDiv>
						);
					}}
				>
					<Suspense fallback={<Loading />}>
						<PreviewTranslation paragraph={paragraph} />
					</Suspense>
				</ErrorBoundary>
			)}
		</>
	);
});

var StyledDiv = styled(ErrorBoundaryWrapper)`
	&:not(:last-child) {
		margin-bottom: 10px;
	}

	p {
		padding-left: 0;
	}
`;
