import { Component, EventEmitter, Input, Output } from "@angular/core";
import { formatTime } from "../../../services/desktop-preview-model";

@Component({
	selector: "chdg-preview-transport-card",
	standalone: true,
	template: `
		<section class="transport-card">
			<div class="artwork" aria-hidden="true">CH</div>
			<div class="metadata">
				<h2>{{ title }}</h2>
				<p>{{ subtitle }}</p>
				<strong>{{ format(currentTime) }} <span>/ {{ format(duration) }}</span></strong>
			</div>
			<div class="transport-controls">
				<button class="round secondary" type="button" aria-label="Seek backward" (click)="seekBy(-5)">|◀</button>
				<button class="round primary" type="button" [attr.aria-label]="isPlaying ? 'Pause' : 'Play'" (click)="togglePlay()">
					{{ isPlaying ? "❚❚" : "▶" }}
				</button>
				<button class="round secondary" type="button" aria-label="Seek forward" (click)="seekBy(5)">▶|</button>
			</div>
			<div class="transport-side">
				<span class="pill">{{ previewStatus }}</span>
				<span class="source">Audio source: {{ audioSourceLabel }}</span>
				<input
					type="range"
					min="0"
					[max]="duration > 0 ? duration : 0"
					step="0.001"
					[value]="safeCurrentTime()"
					[disabled]="duration <= 0"
					(input)="onSeek($event)"
					aria-label="Preview seek"
				/>
			</div>
		</section>
	`,
	styles: [
		`
			.transport-card {
				align-items: center;
				background: linear-gradient(135deg, rgba(12, 20, 38, 0.96), rgba(8, 13, 27, 0.9));
				border: 1px solid rgba(120, 142, 176, 0.18);
				border-radius: 1rem;
				display: grid;
				gap: 1.5rem;
				grid-template-columns: auto minmax(12rem, 1fr) auto minmax(14rem, 0.8fr);
				padding: 1rem;
			}
			.artwork { align-items: center; background: linear-gradient(135deg, #7c2dff, #111827 60%, #f97316); border-radius: 0.75rem; color: #f8fafc; display: flex; font-size: 1.5rem; font-weight: 1000; height: 6rem; justify-content: center; width: 6rem; }
			h2 { margin: 0 0 0.35rem; }
			p { margin: 0 0 0.4rem; }
			strong { color: #a855f7; font-size: 1.05rem; }
			strong span { color: #b6bfce; font-weight: 600; }
			.transport-controls { align-items: center; display: flex; gap: 1rem; justify-content: center; }
			.round { border-radius: 999px; min-height: 3.2rem; min-width: 3.2rem; }
			.round.primary { border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.28), 0 0 28px rgba(139, 92, 246, 0.34); font-size: 1.25rem; min-height: 4.8rem; min-width: 4.8rem; }
			.transport-side { display: grid; gap: 0.6rem; }
			.source { color: #aab4c5; font-size: 0.85rem; }
			input[type="range"] { min-width: 0; width: 100%; }
			@media (max-width: 1080px) { .transport-card { grid-template-columns: auto 1fr; } .transport-controls, .transport-side { grid-column: 1 / -1; } }
		`,
	],
})
export class PreviewTransportCardComponent {
	@Input() title = "Untitled Project";
	@Input() subtitle = "Unknown artist • Expert Pro Drums";
	@Input() currentTime = 0;
	@Input() duration = 0;
	@Input() audioSourceLabel = "unknown";
	@Input() previewStatus = "Preview ready";
	@Input() isPlaying = false;

	@Output() play = new EventEmitter<void>();
	@Output() pause = new EventEmitter<void>();
	@Output() seek = new EventEmitter<number>();

	format(seconds: number): string {
		return formatTime(seconds);
	}

	togglePlay(): void {
		if (this.isPlaying) this.pause.emit();
		else this.play.emit();
	}

	safeCurrentTime(): number {
		return this.clampToDuration(this.currentTime);
	}

	onSeek(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = Number(input.value);
		if (Number.isFinite(value)) this.seek.emit(this.clampToDuration(value));
	}

	seekBy(deltaSeconds: number): void {
		this.seek.emit(this.clampToDuration(this.currentTime + deltaSeconds));
	}

	private clampToDuration(value: number): number {
		if (!Number.isFinite(value)) return 0;
		if (!Number.isFinite(this.duration) || this.duration <= 0) return 0;
		return Math.min(Math.max(value, 0), this.duration);
	}
}
