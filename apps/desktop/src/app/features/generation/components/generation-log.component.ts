import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
	selector: "chdg-generation-log",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./generation-log.component.html",
	styleUrl: "./generation-log.component.css",
})
export class GenerationLogComponent {
	@Input() errorMessage?: string;
	@Input({ required: true }) logs!: string[];
}
