import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import { RouterModule } from "@angular/router";
@Component({
	selector: "chdg-generation-action-bar",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, RouterModule],
	templateUrl: "./generation-action-bar.component.html",
	styleUrl: "./generation-action-bar.component.css",
})
export class GenerationActionBarComponent {
	@Input() canOpenOutputFolder = false;
	@Input() canOpenPreview = false;
	@Input() canStartGeneration = false;
	@Input() generateActionLabel = "Start Generate";
	@Output() openOutputFolder = new EventEmitter<void>();
	@Output() openPreview = new EventEmitter<void>();
	@Output() generate = new EventEmitter<void>();
}
