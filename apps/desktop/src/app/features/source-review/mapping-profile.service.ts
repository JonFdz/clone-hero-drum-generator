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
 */
@Injectable({ providedIn: "root" })
export class MappingProfileService {
	constructor(
		private readonly bridge: DesktopBridgeService,
	) {}

	readonly profiles = signal<MappingOverrideProfile[]>([]);

	async loadProfiles(): Promise<MappingProfileResult> {
		const result = await this.bridge.readMappingProfiles();
		if (result.ok) {
			this.profiles.set(result.data);
			return { ok: true, profiles: result.data };
		}
		return { ok: false, error: result.error.message };
	}

	async saveProfile(
		profile: MappingOverrideProfile,
	): Promise<MappingProfileResult> {
		const result = await this.bridge.saveMappingProfile(profile);
		if (result.ok) {
			this.profiles.set(result.data);
			return { ok: true, profiles: result.data };
		}
		return { ok: false, error: result.error.message };
	}

	async deleteProfile(
		profileId: string,
	): Promise<MappingProfileResult> {
		const result = await this.bridge.deleteMappingProfile?.(profileId);
		if (result?.ok) {
			this.profiles.set(result.data);
			return { ok: true, profiles: result.data };
		}
		return { ok: false, error: result?.error?.message ?? "Delete failed" };
	}
}
