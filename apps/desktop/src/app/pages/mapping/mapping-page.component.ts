import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { ProjectMappingOverrides } from "@chdg/project";
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
    </header>

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

	constructor(private readonly generateState: DesktopGenerateStateService) {}

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
}
