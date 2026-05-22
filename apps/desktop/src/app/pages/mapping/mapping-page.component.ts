import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
	applyMappingProfile,
	type MappingOverrideProfile,
	type MappingProfileApplyMode,
	type ProjectMappingOverrides,
} from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { buildMappingRows, type MappingRow } from "./mapping-page.model";

const PIECES = [
	"kick",
	"snare",
	"hihat_closed",
	"hihat_open",
	"crash",
	"ride",
	"tom_high",
	"tom_mid",
	"tom_floor",
] as const;

@Component({
	selector: "chdg-mapping-page",
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Mapping</p>
      <h1>Project Mapping Overrides</h1>
      <p>Project mapping overrides affect normalization/generation for this project only. They do not edit individual notes.</p>
      <p>Profiles are reusable local templates. Applying a profile copies its overrides into this project.</p>
    </header>

    <section class="card">
      <h2>Mapping Profiles</h2>
      <label>Name <input [(ngModel)]="profileName" /></label>
      <label>Description <input [(ngModel)]="profileDescription" /></label>
      <button (click)="saveProfileFromCurrent()">Create profile from current overrides</button>
      <label>Apply mode
        <select [(ngModel)]="applyMode">
          <option value="merge">merge</option>
          <option value="replace">replace</option>
        </select>
      </label>
      @if (statusMessage) { <p>{{ statusMessage }}</p> }
      @if (profiles.length === 0) {
        <p>No profiles saved yet.</p>
      } @else {
        <ul>
          @for (profile of profiles; track profile.id) {
            <li>
              <strong>{{ profile.name }}</strong> · {{ profileOverrideCount(profile) }} overrides
              <div>{{ applySummary(profile) }}</div>
              <button (click)="applyProfile(profile)">Apply</button>
              <button (click)="updateProfileFromCurrent(profile)">Update from current</button>
              <button (click)="editProfileMetadata(profile)">Edit metadata</button>
              <button (click)="deleteProfile(profile.id)">Delete</button>
            </li>
          }
        </ul>
      }
    </section>

    @if (state().normalizationPreviewStale) {
      <section class="card message warning">
        <p>Mapping overrides changed. Re-run normalization/generation to refresh preview/output.</p>
      </section>
    }

    @if (rows().length === 0) {
      <section class="card">
        <p>Run normalization first to populate source mapping candidates.</p>
      </section>
    } @else {
      <section class="card">
        <h2>Mapping Overrides</h2>
        <table class="mapping-table">
          <thead>
            <tr><th>Source</th><th>Automatic</th><th>Override</th><th>Status</th></tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.key) {
              <tr>
                <td>
                  {{ row.sourceKind }} · {{ row.label ?? row.sourceValue }}
                  @if (row.count !== undefined) { <span>({{ row.count }})</span> }
                </td>
                <td>{{ row.automaticPiece ?? "Source not in current preview" }}</td>
                <td>
                  <select [ngModel]="overrideLabel(row.key)" (ngModelChange)="setOverride(row, $event)">
                    <option value="">Automatic/default</option>
                    <option value="ignore">Ignore</option>
                    @for (piece of pieces; track piece) {
                      <option [value]="piece">{{ piece }}</option>
                    }
                  </select>
                </td>
                <td>
                  @if (row.status === "existing-override") {
                    Existing override
                  } @else {
                    {{ row.status }}
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }
  `,
})
export class MappingPageComponent {
	readonly state = this.generateState.state;
	readonly pieces = PIECES;
	profiles: MappingOverrideProfile[] = [];
	applyMode: MappingProfileApplyMode = "merge";
	profileName = "";
	profileDescription = "";
	statusMessage = "";

	constructor(
		private readonly generateState: DesktopGenerateStateService,
		private readonly bridge: DesktopBridgeService,
	) {
		void this.loadProfiles();
	}

	rows(): MappingRow[] {
		return buildMappingRows(
			this.state().normalizationPreview?.mappingCandidates,
			this.state().mappingOverrides,
		);
	}

	overrideLabel(key: string): string {
		const override = this.state().mappingOverrides[key];
		if (!override) return "";
		return override.target.kind === "ignore" ? "ignore" : override.target.piece;
	}

	setOverride(row: MappingRow, value: string): void {
		const current = { ...this.state().mappingOverrides };
		if (!value) {
			delete current[row.key];
			this.generateState.setMappingOverrides(current);
			return;
		}
		current[row.key] =
			value === "ignore"
				? {
						sourceKind: row.sourceKind,
						key: row.key,
						target: { kind: "ignore" as const },
				  }
				: {
						sourceKind: row.sourceKind,
						key: row.key,
						target: { kind: "piece" as const, piece: value as (typeof PIECES)[number] },
				  };
		this.generateState.setMappingOverrides(current as ProjectMappingOverrides);
	}

	async loadProfiles(): Promise<void> {
		const result = await this.bridge.readMappingProfiles();
		if (!result.ok) {
			this.statusMessage = result.error.message;
			return;
		}
		this.profiles = result.data;
	}

	async saveProfileFromCurrent(): Promise<void> {
		if (!this.profileName.trim()) return;
		const now = new Date().toISOString();
		const profile: MappingOverrideProfile = {
			id: crypto.randomUUID(),
			name: this.profileName.trim(),
			description: this.profileDescription.trim() || undefined,
			overrides: { ...this.state().mappingOverrides },
			createdAt: now,
			updatedAt: now,
		};
		const result = await this.bridge.saveMappingProfile(profile);
		if (!result.ok) {
			this.statusMessage = result.error.message;
			return;
		}
		this.profiles = result.data;
		this.statusMessage = "Profile saved.";
	}

	async deleteProfile(profileId: string): Promise<void> {
		const result = await this.bridge.deleteMappingProfile(profileId);
		if (!result.ok) {
			this.statusMessage = result.error.message;
			return;
		}
		this.profiles = result.data;
	}

	async updateProfileFromCurrent(profile: MappingOverrideProfile): Promise<void> {
		const result = await this.bridge.saveMappingProfile({
			...profile,
			overrides: { ...this.state().mappingOverrides },
			updatedAt: new Date().toISOString(),
		});
		if (!result.ok) {
			this.statusMessage = result.error.message;
			return;
		}
		this.profiles = result.data;
	}

	async editProfileMetadata(profile: MappingOverrideProfile): Promise<void> {
		const name = window.prompt("Profile name", profile.name)?.trim();
		if (!name) return;
		const description =
			window.prompt("Profile description", profile.description ?? "")?.trim() ??
			undefined;
		const result = await this.bridge.saveMappingProfile({
			...profile,
			name,
			description,
			updatedAt: new Date().toISOString(),
		});
		if (!result.ok) {
			this.statusMessage = result.error.message;
			return;
		}
		this.profiles = result.data;
	}

	applySummary(profile: MappingOverrideProfile): string {
		const summary = applyMappingProfile({
			projectOverrides: this.state().mappingOverrides,
			profileOverrides: profile.overrides,
			mode: this.applyMode,
		}).summary;
		return `Current ${Object.keys(this.state().mappingOverrides).length}, Profile ${Object.keys(profile.overrides).length}, Added ${summary.added}, Replaced ${summary.replaced}, Kept ${summary.kept}`;
	}

	profileOverrideCount(profile: MappingOverrideProfile): number {
		return Object.keys(profile.overrides).length;
	}

	applyProfile(profile: MappingOverrideProfile): void {
		const result = applyMappingProfile({
			projectOverrides: this.state().mappingOverrides,
			profileOverrides: profile.overrides,
			mode: this.applyMode,
		});
		this.generateState.setMappingOverrides(result.overrides);
		this.statusMessage = `Applied profile ${profile.name} (${this.applyMode}).`;
	}
}
