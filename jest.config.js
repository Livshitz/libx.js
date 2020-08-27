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
	testRegex: "(/__tests__/.*|/tests/.*(\\.|/)(test|spec))\\.ts$",
	moduleFileExtensions: [
	  "ts",
	  "tsx",
	  "js",
	  "jsx",
	  "json",
	  "node"
	],
	verbose: true,
	// globals: {
	// 		'ts-jest': {
	// 	  		tsConfig: 'tsconfig.json'
	// 			tsConfig: "tsconfig.test.json"
	// 		}
	// }
	reporters: [ "default", "jest-junit" ],
	// testEnvironment: 'node',
	coverageDirectory: ".tmp/coverage"
}