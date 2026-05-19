import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const desktopRoot = join(process.cwd(), "apps/desktop");

describe("Electron preload build configuration", () => {
	it("uses a CommonJS preload source extension", () => {
		const preloadSource = readFileSync(join(desktopRoot, "electron/preload.cts"), "utf8");

		expect(preloadSource).toContain("contextBridge.exposeInMainWorld");
		expect(preloadSource).toContain("ipcRenderer.invoke");
	});

	it("points BrowserWindow at the CommonJS preload artifact", () => {
		const mainSource = readFileSync(join(desktopRoot, "electron/main.ts"), "utf8");

		expect(mainSource).toContain('path.join(__dirname, "preload.cjs")');
		expect(mainSource).not.toContain('path.join(__dirname, "preload.js")');
	});

	it("includes .cts files in the Electron TypeScript build", () => {
		const tsconfig = readFileSync(join(desktopRoot, "tsconfig.electron.json"), "utf8");

		expect(tsconfig).toContain('"electron/**/*.cts"');
	});
});
