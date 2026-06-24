import { describe, expect, it } from "vitest";
import { MappingProfileService } from "./mapping-profile.service";

describe("MappingProfileService", () => {
	it("starts with empty profiles", () => {
		const s = new MappingProfileService(null as never);
		expect(s.profiles()).toEqual([]);
	});
});
