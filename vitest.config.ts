import { defineConfig } from "vitest/config";
import ts from "typescript";

export default defineConfig({
  plugins: [{
    name: "angular-legacy-decorators",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/apps/desktop/src/") || !id.endsWith(".ts")) {
        return;
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
  }],
  test: { globals: true, environment: "node" },
});
