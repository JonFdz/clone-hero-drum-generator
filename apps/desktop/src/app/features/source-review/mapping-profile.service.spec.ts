import { describe, expect, it } from "vitest";
import { MappingProfileService } from "./mapping-profile.service";
import type { MappingOverrideProfile } from "@chdg/project/browser";

function makeProfile(overrides: Partial<MappingOverrideProfile> = {}): MappingOverrideProfile {
	const now = "2026-06-24T00:00:00.000Z";
	return {
		id: "p1",
		name: "Live Drums",
		description: undefined,
		overrides: {},
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

describe("MappingProfileService", () => {
	it("starts with empty profiles and no profile error", () => {
		const s = new MappingProfileService({} as never);
		expect(s.profiles()).toEqual([]);
		expect(s.profileError()).toBeUndefined();
	});

	it("loadProfiles stores profiles and clears profileError on success", async () => {
		const profiles = [makeProfile({ id: "a" })];
		const bridge = {
			readMappingProfiles: async () => ({ ok: true as const, data: profiles }),
		};
		const s = new MappingProfileService(bridge as never);
		s.profileError.set("previous");
		const result = await s.loadProfiles();
		expect(result).toEqual({ ok: true, profiles });
		expect(s.profiles()).toEqual(profiles);
		expect(s.profileError()).toBeUndefined();
	});

	it("loadProfiles returns a typed failure and preserves current profiles", async () => {
		const bridge = {
			readMappingProfiles: async () => ({
				ok: false as const,
				error: { message: "read failed" },
			}),
		};
		const s = new MappingProfileService(bridge as never);
		s.profiles.set([makeProfile({ id: "keep" })]);
		const result = await s.loadProfiles();
		expect(result).toEqual({ ok: false, error: "read failed" });
		expect(s.profiles()[0].id).toBe("keep");
		expect(s.profileError()).toBe("read failed");
	});

	it("saveProfile upserts profiles and clears profileError on success", async () => {
		const profile = makeProfile({ id: "new" });
		const profiles = [profile];
		const bridge = {
			saveMappingProfile: async (input: MappingOverrideProfile) => ({
				ok: true as const,
				data: [input],
			}),
		};
		const s = new MappingProfileService(bridge as never);
		s.profileError.set("previous");
		const result = await s.saveProfile(profile);
		expect(result).toEqual({ ok: true, profiles });
		expect(s.profiles()).toEqual(profiles);
		expect(s.profileError()).toBeUndefined();
	});

	it("saveProfile returns a typed failure and leaves profiles intact", async () => {
		const bridge = {
			saveMappingProfile: async () => ({
				ok: false as const,
				error: { message: "save failed" },
			}),
		};
		const s = new MappingProfileService(bridge as never);
		s.profiles.set([makeProfile({ id: "keep" })]);
		const result = await s.saveProfile(makeProfile({ id: "new" }));
		expect(result).toEqual({ ok: false, error: "save failed" });
		expect(s.profiles()[0].id).toBe("keep");
		expect(s.profileError()).toBe("save failed");
	});

	it("deleteProfile updates local profiles and clears profileError on success", async () => {
		const profiles = [makeProfile({ id: "remaining" })];
		const bridge = {
			deleteMappingProfile: async (id: string) => ({
				ok: true as const,
				data: profiles,
				deletedId: id,
			}),
		};
		const s = new MappingProfileService(bridge as never);
		s.profileError.set("previous");
		const result = await s.deleteProfile("gone");
		expect(result).toEqual({ ok: true, profiles });
		expect(s.profiles()).toEqual(profiles);
		expect(s.profileError()).toBeUndefined();
	});

	it("deleteProfile returns a typed failure and keeps selection data intact", async () => {
		const bridge = {
			deleteMappingProfile: async () => ({
				ok: false as const,
				error: { message: "delete failed" },
			}),
		};
		const s = new MappingProfileService(bridge as never);
		s.profiles.set([makeProfile({ id: "keep" })]);
		const result = await s.deleteProfile("keep");
		expect(result).toEqual({ ok: false, error: "delete failed" });
		expect(s.profiles()[0].id).toBe("keep");
		expect(s.profileError()).toBe("delete failed");
	});

	it("overrideCountOf counts the number of stored overrides", () => {
		const s = new MappingProfileService({} as never);
		const profile = makeProfile({
			overrides: {
				"midi:36": { sourceKind: "midi", key: "midi:36", target: { kind: "piece", piece: "kick" } },
				"midi:38": { sourceKind: "midi", key: "midi:38", target: { kind: "ignore" } },
			} as never,
		});
		expect(s.overrideCountOf(profile)).toBe(2);
	});
});