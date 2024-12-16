import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		globalSetup: 'vitest.global-setup.mts',
		coverage: {
			provider: 'v8', //'istanbul'
		},
	},
});

