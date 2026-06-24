import {
	ChangeDetectionStrategy,
	Component,
	Input,
	computed,
	signal,
} from "@angular/core";
import { formatTime } from "../../../services/desktop-preview-model";

type WaveformStatus = "idle" | "loading" | "ready" | "error" | "empty";

@Component({
	selector: "chdg-preview-footer-stats",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./preview-footer-stats.component.html",
	styleUrl: "./preview-footer-stats.component.css",
})
export class PreviewFooterStatsComponent {
	@Input() audioSourceLabel = "unknown";
	@Input() duration = 0;
	@Input() noteCount = 0;

	private readonly _waveformStatus = signal<WaveformStatus>("idle");
	private readonly _waveformError = signal<string | null>(null);

	@Input() set waveformStatus(value: WaveformStatus) {
		this._waveformStatus.set(value);
	}
	get waveformStatus(): WaveformStatus {
		return this._waveformStatus();
	}

	@Input() set waveformError(value: string | null) {
		this._waveformError.set(value);
	}
	get waveformError(): string | null {
		return this._waveformError();
	}

	readonly statusText = computed<string>(() => {
		const status = this._waveformStatus();
		if (status === "ready") return "Ready";
		if (status === "loading") return "Loading waveform";
		if (status === "error")
			return this._waveformError() ?? "Waveform unavailable";
		if (status === "empty") return "No waveform";
		return "Idle";
	});

	formatDuration(seconds: number): string {
		return formatTime(seconds);
	}
}
