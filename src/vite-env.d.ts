/* eslint-disable no-unused-vars */
/// <reference types="vite/client" />

// Add data types to window.navigator ambiently for implicit use in the entire project. See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
/// <reference types="user-agent-data-types" />

/// <reference types="vite-plugin-comlink/client" />

interface ImportMetaEnv {
	readonly VITE_OPENAI_API_KEY: string;
	readonly VITE_OPENAI_API_KEY_ALIAS: string;

	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
