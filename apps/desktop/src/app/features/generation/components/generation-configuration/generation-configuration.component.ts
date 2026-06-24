import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

export type GenerationConfigRow = {
	icon: string;
	label: string;
	value: string;
	status: "ok" | "warning" | "missing";
	glyph: string;
};
@Component({
	selector: "chdg-generation-configuration",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./generation-configuration.component.html",
	styleUrl: "./generation-configuration.component.css",
})
export class GenerationConfigurationComponent {
	@Input({ required: true }) rows!: GenerationConfigRow[];
}
