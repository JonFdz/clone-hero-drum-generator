import { describe, expect, it } from "vitest";
import { ProjectSessionStore } from "./project-session.store";
import type { MissingPathWarning } from "./project-session.model";

describe("ProjectSessionStore", () => {
	it("starts as an untitled, clean, not-generated session with no missing paths", () => {
		const store = new ProjectSessionStore();
		expect(store.projectName()).toBe("Untitled");
		expect(store.isDirty()).toBe(false);
		expect(store.outputStatus()).toBe("not-generated");
		expect(store.missingPathWarnings()).toEqual([]);
		expect(store.hasProject()).toBe(false);
	});

	it("hydrates identity/status from a payload and clears dirty state", () => {
		const store = new ProjectSessionStore();
		store.markDirty();
		store.applyHydration({
			project: {
				projectId: "project-demo",
				artist: "Artist",
				songName: "Demo",
				projectName: "Expert Drums",
				displayName: "Artist - Demo - Expert Drums",
			},
			projectName: "Demo",
			projectFilePath: "/p/demo.chdg.json",
			generationStatus: "generated",
			selectedTracks: [],
			metadata: {},
		});
		expect(store.projectName()).toBe("Demo");
		expect(store.project()?.projectId).toBe("project-demo");
		expect(store.projectFilePath()).toBe("/p/demo.chdg.json");
		expect(store.outputStatus()).toBe("generated");
		expect(store.isDirty()).toBe(false);
		expect(store.hasProject()).toBe(true);
	});

	it("markNeedsRegenerate transitions generated -> needs-regenerate and marks dirty", () => {
		const store = new ProjectSessionStore();
		store.applyHydration({
			project: {
				projectId: "project-demo",
				artist: "Artist",
				songName: "Demo",
				projectName: "Expert Drums",
				displayName: "Artist - Demo - Expert Drums",
			},
			projectName: "Demo",
			generationStatus: "generated",
			selectedTracks: [],
			metadata: {},
		});
		store.markNeedsRegenerate();
		expect(store.outputStatus()).toBe("needs-regenerate");
		expect(store.isDirty()).toBe(true);
	});

	it("markNeedsRegenerate only marks dirty when not yet generated", () => {
		const store = new ProjectSessionStore();
		store.markNeedsRegenerate();
		expect(store.outputStatus()).toBe("not-generated");
		expect(store.isDirty()).toBe(true);
	});

	it("markGenerated and markFailed set status and dirty", () => {
		const store = new ProjectSessionStore();
		store.markGenerated();
		expect(store.outputStatus()).toBe("generated");
		expect(store.isDirty()).toBe(true);
		store.markFailed();
		expect(store.outputStatus()).toBe("failed");
	});

	it("setProjectName marks dirty", () => {
		const store = new ProjectSessionStore();
		store.setProjectName("New Name");
		expect(store.projectName()).toBe("New Name");
		expect(store.isDirty()).toBe(true);
	});

	it("setMissingPaths and clearMissingPaths manage warnings", () => {
		const store = new ProjectSessionStore();
		const warnings: MissingPathWarning[] = [
			{ kind: "sourcePath", path: "/missing.mid", message: "Missing sourcePath: /missing.mid" },
		];
		store.setMissingPaths(warnings);
		expect(store.missingPathWarnings()).toEqual(warnings);
		store.clearMissingPaths();
		expect(store.missingPathWarnings()).toEqual([]);
	});

	it("resetActiveProject restores initial session state", () => {
		const store = new ProjectSessionStore();
		store.applyHydration({
			project: {
				projectId: "project-demo",
				artist: "Artist",
				songName: "Demo",
				projectName: "Expert Drums",
				displayName: "Artist - Demo - Expert Drums",
			},
			projectName: "Demo",
			projectFilePath: "/p.json",
			generationStatus: "generated",
			selectedTracks: [],
			metadata: {},
		});
		store.markDirty();
		store.resetActiveProject();
		expect(store.projectName()).toBe("Untitled");
		expect(store.projectFilePath()).toBeUndefined();
		expect(store.project()).toBeUndefined();
		expect(store.outputStatus()).toBe("not-generated");
		expect(store.isDirty()).toBe(false);
	});
});
