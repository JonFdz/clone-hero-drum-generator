import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
	selector: "chdg-generation-readiness",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./generation-readiness.component.html",
	styleUrl: "./generation-readiness.component.css",
})
export class GenerationReadinessComponent {
	@Input({ required: true }) tone!: "success" | "warning" | "danger" | "running";
	@Input({ required: true }) icon!: string;
	@Input({ required: true }) label!: string;
	@Input({ required: true }) detail!: string;
}
