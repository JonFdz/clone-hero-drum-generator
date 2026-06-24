import { Injectable, signal } from "@angular/core";
import type { MappingOverrideProfile } from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";

export type MappingProfileResult =
	| { ok: true; profiles: MappingOverrideProfile[] }
	| { ok: false; error: string };

/**
 * Feature service for mapping-profile CRUD.
 * Owns all bridge interaction for mapping profiles so that
 * Source Review page/components never import DesktopBridgeService.
 *
 * `saveProfile` is an upsert on the backend: it is used for create, update
 * (from current overrides), and metadata edits. Typed outcomes are returned
 * for every operation; the latest non-fatal error is exposed via
 * `profileError` so the page can surface it in its status surface and clear it
 * on the next success.
 */
@Injectable({ providedIn: "root" })
export class MappingProfileService {
	constructor(private readonly bridge: DesktopBridgeService) {}

	readonly profiles = signal<MappingOverrideProfile[]>([]);
	readonly profileError = signal<string | undefined>(undefined);

	/** Number of overrides stored on a profile (presentation-ready value). */
	overrideCountOf(profile: MappingOverrideProfile): number {
		return Object.keys(profile.overrides).length;
	}

	async loadProfiles(): Promise<MappingProfileResult> {
		const result = await this.bridge.readMappingProfiles();
		if (result.ok) {
			this.profiles.set(result.data);
			this.profileError.set(undefined);
			return { ok: true, profiles: result.data };
		}
		this.profileError.set(result.error.message);
		return { ok: false, error: result.error.message };
	}

	/**
	 * Upserts a profile. Used to create a new profile, update an existing
	 * profile from current overrides, and edit profile metadata.
	 */
	async saveProfile(
		profile: MappingOverrideProfile,
	): Promise<MappingProfileResult> {
		const result = await this.bridge.saveMappingProfile(profile);
		if (result.ok) {
			this.profiles.set(result.data);
			this.profileError.set(undefined);
			return { ok: true, profiles: result.data };
		}
		this.profileError.set(result.error.message);
		return { ok: false, error: result.error.message };
	}

	async deleteProfile(profileId: string): Promise<MappingProfileResult> {
		const result = await this.bridge.deleteMappingProfile(profileId);
		if (result.ok) {
			this.profiles.set(result.data);
			this.profileError.set(undefined);
			return { ok: true, profiles: result.data };
		}
		this.profileError.set(result.error.message);
		return { ok: false, error: result.error.message };
	}
}
