// @ts-check
// Angular ESLint flat config for the @chdg/desktop renderer.
//
// Scope note (issue #74 foundation): lint is enabled for the new architectural
// boundaries (core/, shared/, features/) plus the application shell and routes.
// Legacy pages/ and services/ are progressively brought under lint in #75/#76
// as their internals are migrated. The follow-up register records this.
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default tseslint.config(
	{
		ignores: [
			"dist/**",
			".angular/**",
			"node_modules/**",
			"electron/**",
			"src/app/pages/**",
			"src/app/services/**",
		],
	},
	{
		files: ["**/*.ts"],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...angular.configs.tsRecommended,
		],
		rules: {
			"@angular-eslint/component-selector": [
				"error",
				{ type: "element", prefix: "chdg", style: "kebab-case" },
			],
			"@angular-eslint/directive-selector": [
				"error",
				{ type: "attribute", prefix: "chdg", style: "camelCase" },
			],
		},
	},
	{
		files: ["**/*.html"],
		extends: [
			...angular.configs.templateRecommended,
		],
		rules: {},
	},
);
