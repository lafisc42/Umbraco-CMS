import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// Builds the extension as one ES module for deployment to App_Plugins/MobileContent.
// Backoffice modules stay external; the backoffice import map provides them at runtime.
export default defineConfig({
	root,
	build: {
		lib: {
			entry: 'index.ts',
			formats: ['es'],
			fileName: () => 'mobile-content.js',
		},
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			external: [/^@umbraco-cms\//, /^@umbraco-ui\//],
		},
	},
});
