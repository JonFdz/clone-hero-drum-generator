import { Component, Input } from "@angular/core";
import { formatTime } from "../../../services/desktop-preview-model";

@Component({
	selector: "chdg-preview-footer-stats",
	standalone: true,
	template: `
		<div class="footer-stats">
			<span>▣ Source: {{ audioSourceLabel }}</span>
			<span>◷ Chart Length: {{ formatDuration(duration) }}</span>
			<span>▥ Notes: {{ noteCount }}</span>
			<span [class.error]="waveformStatus === 'error'">{{ statusText() }}</span>
		</div>
	`,
	styles: [
		`
			.footer-stats {
				align-items: center;
				background: rgba(255, 255, 255, 0.025);
				border: 1px solid rgba(197, 209, 225, 0.12);
				border-radius: 0.75rem;
				color: #aab4c5;
				display: grid;
				gap: 1rem;
				grid-template-columns: repeat(4, minmax(0, 1fr));
				padding: 0.9rem 1rem;
			}
			span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
			.error { color: #ff8ca0; }
			@media (max-width: 980px) { .footer-stats { grid-template-columns: 1fr 1fr; } }
		`,
	],
})
export class PreviewFooterStatsComponent {
	@Input() audioSourceLabel = "unknown";
	@Input() duration = 0;
	@Input() noteCount = 0;
	@Input() waveformStatus: "idle" | "loading" | "ready" | "error" | "empty" =
		"idle";
	@Input() waveformError: string | null = null;

	formatDuration(seconds: number): string {
		return formatTime(seconds);
	}

	statusText(): string {
		if (this.waveformStatus === "ready") return "Ready";
		if (this.waveformStatus === "loading") return "Loading waveform";
		if (this.waveformStatus === "error")
			return this.waveformError ?? "Waveform unavailable";
		if (this.waveformStatus === "empty") return "No waveform";
		return "Idle";
	}
}
