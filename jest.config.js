module.exports = {
	roots: [
	  "<rootDir>"
	],
	transform: {
		"^.+\\.jsx?$": "babel-jest",
	  	"^.+\\.ts?$": "ts-jest"
	},
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
	//[jest-config].globals.ts-jest.tsConfig
	// globals: {
	// 	"ts-jest": {
	// 		tsConfig: "tsconfig.test.json"
	// 	}
	// }
}