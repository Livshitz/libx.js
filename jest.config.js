process.env.TZ = 'UTC';

module.exports = {
	roots: [
		"<rootDir>"
	],
	transform: {
		"^.+\\.jsx?$": "babel-jest",
		"^.+\\.ts?$": "ts-jest"
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	// globalSetup: './tests/setup.ts',
	setupFiles: [
		"<rootDir>/tests/setup.ts"
	],
	testRegex: "(/__tests__/.*|/tests/(?!_template).*(\\.|/|)(test|spec))\\.ts$",
	moduleFileExtensions: [
		"ts",
		"tsx",
		"js",
		"jsx",
		"json",
		"node"
	],
	testEnvironment: "node",
	verbose: true,
	// globals: {
	// 		'ts-jest': {
	// 	  		tsConfig: 'tsconfig.json'
	// 			tsConfig: "tsconfig.test.json"
	// 		}
	// }
	reporters: ["default", "jest-junit"],
	coverageDirectory: ".tmp/coverage",
	coverageReporters: [
		"cobertura",
		"html"
	]
}