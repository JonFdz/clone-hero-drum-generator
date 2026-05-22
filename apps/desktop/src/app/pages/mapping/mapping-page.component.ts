import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { ProjectMappingOverrides } from "@chdg/project";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";

type MappingRow = {
	key: string;
	sourceKind: "midi" | "gpif";
	sourceValue: string;
	automatic: string;
	count: number;
};

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
    </header>

    @if (!state().normalizationPreview) {
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
                <td>{{ row.sourceKind }} · {{ row.sourceValue }} ({{ row.count }})</td>
                <td>{{ row.automatic }}</td>
                <td>
                  <select [ngModel]="overrideLabel(row.key)" (ngModelChange)="setOverride(row, $event)">
                    <option value="">Automatic/default</option>
                    <option value="ignore">Ignore</option>
                    @for (piece of pieces; track piece) {
                      <option [value]="piece">{{ piece }}</option>
                    }
                  </select>
                </td>
                <td>{{ statusLabel(row.key) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
      <section class="card">
        <p>When overrides change: project is marked dirty, output becomes needs-regenerate (if generated), and normalization preview is marked stale.</p>
      </section>
    }
  `,
})
export class MappingPageComponent {
	readonly state = this.generateState.state;
	readonly pieces = PIECES;

	constructor(
		private readonly generateState: DesktopGenerateStateService,
		private readonly projectState: DesktopProjectStateService,
	) {}

	rows(): MappingRow[] {
		const preview = this.state().normalizationPreview;
		if (!preview) return [];
		const byKey = new Map<string, MappingRow>();
		for (const hit of preview.firstHits) {
			const source = hit.source;
			if ("midiNote" in source) {
				const key = `midi:${source.midiNote}`;
				const current = byKey.get(key);
				byKey.set(key, {
					key,
					sourceKind: "midi",
					sourceValue: `note ${source.midiNote}`,
					automatic: hit.piece,
					count: (current?.count ?? 0) + 1,
				});
				continue;
			}
			const raw = source.rawArticulation?.trim();
			if (!raw) continue;
			const key = `gpif:${raw.toLowerCase()}`;
			const current = byKey.get(key);
			byKey.set(key, {
				key,
				sourceKind: "gpif",
				sourceValue: raw,
				automatic: hit.piece,
				count: (current?.count ?? 0) + 1,
			});
		}
		return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
	}

	overrideLabel(key: string): string {
		const override = this.state().mappingOverrides[key];
		if (!override) return "";
		return override.target.kind === "ignore" ? "ignore" : override.target.piece;
	}

	statusLabel(key: string): string {
		const override = this.state().mappingOverrides[key];
		return override ? "override" : "default";
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
		this.projectState.markNeedsRegenerate();
	}
}
