import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [comlink(), react(), visualizer({ open: false, gzipSize: true, filename: 'chunks-report.html' })],
	worker: {
		plugins: () => [comlink()],
	},
	server: {
		open: true,
	},
	build: {
		outDir: 'build',
		sourcemap: true,
		rollupOptions: {
			// suppress error messages relate to Rollup bug https://github.com/vitejs/vite/issues/15012
			onLog(level, log, handler) {
				if (log.cause instanceof Error && log.cause.message === `Can't resolve original location of error.`) {
					return;
				}
				handler(level, log);
			},
			output: {
				manualChunks: {
					// https://dev.to/tassiofront/splitting-vendor-chunk-with-vite-and-loading-them-async-15o3
					lodash: ['lodash'],
					html2canvas: ['html2canvas'],
					docx: ['docx'],
					jspdf: ['jspdf'],
					dnd: ['@hello-pangea/dnd'],
					reactRouter: ['react-router-dom', '@remix-run/router', 'react-router'],
				},
			},
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests',
		restoreMocks: true,
	},
});
