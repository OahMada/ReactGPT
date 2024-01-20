import { createContext, useState, useContext } from 'react';

interface AutoFocusContextType {
	autoFocus: boolean;
	setAutoFocus: React.Dispatch<React.SetStateAction<boolean>>;
}

export var AutoFocusContext = createContext<AutoFocusContextType | null>(null);

export default function AutoFocusWrapper({ children }: { children: React.ReactNode }) {
	let [autoFocus, setAutoFocus] = useState(false);

	return (
		<AutoFocusContext.Provider
			value={{
				autoFocus,
				setAutoFocus,
			}}
		>
			{children}
		</AutoFocusContext.Provider>
	);
}

export var useAutoFocusContext = () => {
	let autoFocusContext = useContext(AutoFocusContext);
	/* v8 ignore next 3 */
	if (!autoFocusContext) {
		throw new Error('useAutoFocusContext has to be used within <CurrentUserContext.Provider>');
	}
	return autoFocusContext;
};
