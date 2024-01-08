import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [comlink(), react()],
	worker: {
		plugins: () => [comlink()],
	},
	server: {
		open: true,
	},
	build: {
		outDir: 'build',
		sourcemap: true,
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests',
		restoreMocks: true,
	},
});
