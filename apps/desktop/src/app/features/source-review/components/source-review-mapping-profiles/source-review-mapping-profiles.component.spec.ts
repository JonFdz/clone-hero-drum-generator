import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewMappingProfilesComponent } from "./source-review-mapping-profiles.component";

describe("SourceReviewMappingProfilesComponent", () => {
	function setup() {
		const c = new SourceReviewMappingProfilesComponent();
		c.profiles = [
			{ id: "a", name: "A", description: undefined, overrideCount: 1 },
			{ id: "b", name: "B", description: "desc", overrideCount: 2 },
		];
		c.selectedProfile = c.profiles[1];
		c.applyMode = "merge";
		c.applyModeOptions = [
			{ value: "merge", label: "merge" },
			{ value: "replace", label: "replace" },
		];
		c.status = "Selected: B";
		c.error = undefined;
		c.overrideCount = 3;
		return c;
	}

	it("emits selectProfile by id", () => {
		const c = setup();
		let id = "";
		c.selectProfile.subscribe((v) => (id = v));
		c.selectProfile.emit("a");
		expect(id).toBe("a");
	});

	it("emits apply, create, update, edit, delete intents", () => {
		const c = setup();
		const intents: string[] = [];
		c.apply.subscribe(() => intents.push("apply"));
		c.requestCreate.subscribe(() => intents.push("create"));
		c.requestUpdate.subscribe(() => intents.push("update"));
		c.requestEdit.subscribe(() => intents.push("edit"));
		c.requestDelete.subscribe(() => intents.push("delete"));
		c.apply.emit();
		c.requestCreate.emit();
		c.requestUpdate.emit();
		c.requestEdit.emit();
		c.requestDelete.emit();
		expect(intents).toEqual(["apply", "create", "update", "edit", "delete"]);
	});

	it("emits apply mode changes", () => {
		const c = setup();
		let mode = "";
		c.setApplyMode.subscribe((m) => (mode = m));
		c.setApplyMode.emit("replace");
		expect(mode).toBe("replace");
	});
});
