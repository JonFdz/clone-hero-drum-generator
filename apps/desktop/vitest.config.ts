import { defineConfig } from "vitest/config";
import ts from "typescript";

// Angular standalone components use the experimental decorators syntax. The
// Angular compiler handles this at build time, but Vitest runs against plain
// TypeScript, so we transpile decorators down to ES2022 classes here.
export default defineConfig({
	plugins: [
		{
			name: "angular-legacy-decorators",
			enforce: "pre",
			transform(code, id) {
				if (!id.includes("/src/") || !id.endsWith(".ts")) {
					return null;
				}

				return {
					code: ts.transpileModule(code, {
						compilerOptions: {
							experimentalDecorators: true,
							module: ts.ModuleKind.ESNext,
							target: ts.ScriptTarget.ES2022,
							useDefineForClassFields: false,
						},
						fileName: id,
					}).outputText,
					map: null,
				};
			},
		},
	],
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.test.ts"],
	},
});
