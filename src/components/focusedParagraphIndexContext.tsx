import { createContext, useRef, useContext, MutableRefObject } from 'react';

var FocusedParagraphIndexContext = createContext<MutableRefObject<number> | null>(null);

export function FocusedParagraphIndexContextWrapper({ children }: { children: React.ReactNode }) {
	let focusedParagraphIndexRef = useRef(-1);
	return <FocusedParagraphIndexContext.Provider value={focusedParagraphIndexRef}>{children}</FocusedParagraphIndexContext.Provider>;
}

export var useFocusedParagraphIndexContext = () => {
	let focusedParagraphIndexContext = useContext(FocusedParagraphIndexContext);
	/* v8 ignore next 3 */
	if (!focusedParagraphIndexContext) {
		throw new Error('useAutoFocusContext has to be used within <FocusedParagraphIndexContext.Provider>');
	}
	return focusedParagraphIndexContext;
};
