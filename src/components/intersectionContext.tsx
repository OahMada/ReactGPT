import { createContext, useContext, useRef, MutableRefObject } from 'react';
import { useIntersectionObserver } from '@uidotdev/usehooks';

interface IntersectionContextType {
	ref: ReturnType<typeof useIntersectionObserver>[0];
	shouldConstrainHeightRef: MutableRefObject<boolean>;
}

var IntersectionContext = createContext<IntersectionContextType | null>(null);

export function IntersectionContextWrapper({ children }: { children: React.ReactNode }) {
	let shouldConstrainHeightRef = useRef(true);
	let [ref, entry] = useIntersectionObserver({ threshold: 1 });
	if (entry && entry.intersectionRatio < 1) {
		shouldConstrainHeightRef.current = false;
	} else {
		shouldConstrainHeightRef.current = true;
	}
	return <IntersectionContext.Provider value={{ ref, shouldConstrainHeightRef }}>{children}</IntersectionContext.Provider>;
}

export var useIntersectionContext = () => {
	let result = useContext(IntersectionContext);
	/* v8 ignore next 3 */
	if (!result) {
		throw new Error('useIntersectionContext has to be used within <IntersectionContext.Provider>');
	}
	return result;
};
