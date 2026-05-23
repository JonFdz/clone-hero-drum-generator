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
			<div class="transport-playback">
				<div class="transport-controls">
					<button class="round secondary" type="button" aria-label="Seek backward" (click)="seekBy(-5)">|◀</button>
					<button class="round primary" type="button" [attr.aria-label]="isPlaying ? 'Pause' : 'Play'" (click)="togglePlay()">
						{{ isPlaying ? "❚❚" : "▶" }}
					</button>
					<button class="round secondary" type="button" aria-label="Seek forward" (click)="seekBy(5)">▶|</button>
				</div>
				<div class="seek-control" [class.disabled]="duration <= 0">
					<div class="seek-track" aria-hidden="true">
						<div class="seek-progress" [style.width.%]="seekProgressPercent()"></div>
						<div class="seek-thumb" [style.left.%]="seekProgressPercent()" [style.transform]="seekThumbTransform()"></div>
					</div>
					<input
						class="seek-input"
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
				gap: 1.25rem;
				grid-template-columns: auto minmax(12rem, 0.75fr) minmax(20rem, 1.25fr);
				min-width: 0;
				padding: 0.9rem 1rem;
			}
			.artwork { align-items: center; background: linear-gradient(135deg, #7c2dff, #111827 60%, #f97316); border-radius: 0.75rem; color: #f8fafc; display: flex; font-size: 1.5rem; font-weight: 1000; height: 6rem; justify-content: center; width: 6rem; }
			h2 { margin: 0 0 0.35rem; }
			p { margin: 0 0 0.4rem; }
			strong { color: #a855f7; font-size: 1.05rem; }
			strong span { color: #b6bfce; font-weight: 600; }
			.transport-playback { display: grid; gap: 0.8rem; min-width: 0; }
			.transport-controls { align-items: center; display: flex; flex-wrap: nowrap; gap: 1rem; justify-content: center; min-width: max-content; }
			.round { aspect-ratio: 1; border-radius: 999px; flex: 0 0 auto; height: 3.2rem; min-height: 3.2rem; min-width: 3.2rem; padding: 0; width: 3.2rem; }
			.round.primary { border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.28), 0 0 28px rgba(139, 92, 246, 0.34); font-size: 1.25rem; height: 4.6rem; min-height: 4.6rem; min-width: 4.6rem; width: 4.6rem; }
			.seek-control { height: 1.25rem; min-width: 0; position: relative; }
			.seek-track { background: rgba(255, 255, 255, 0.22); border-radius: 999px; height: 0.35rem; left: 0; overflow: visible; position: absolute; right: 0; top: 50%; transform: translateY(-50%); }
			.seek-progress { background: #93c5fd; border-radius: inherit; height: 100%; }
			.seek-thumb { background: #93c5fd; border-radius: 999px; box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.18); height: 1rem; position: absolute; top: 50%; width: 1rem; }
			.seek-input { cursor: pointer; inset: 0; margin: 0; opacity: 0; position: absolute; width: 100%; }
			.seek-control.disabled { opacity: 0.5; }
			.seek-control.disabled .seek-input { cursor: not-allowed; }
			@media (max-width: 1350px) { .transport-card { grid-template-columns: auto minmax(0, 1fr); } .transport-playback { grid-column: 1 / -1; } }
			@media (max-width: 560px) { .transport-card { grid-template-columns: 1fr; } .artwork { height: 5rem; width: 5rem; } }
		`,
	],
})
export class PreviewTransportCardComponent {
	@Input() title = "Untitled Project";
	@Input() subtitle = "Unknown artist • Expert Pro Drums";
	@Input() currentTime = 0;
	@Input() duration = 0;
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

	seekProgressPercent(): number {
		if (!Number.isFinite(this.duration) || this.duration <= 0) return 0;
		return (this.safeCurrentTime() / this.duration) * 100;
	}

	seekThumbTransform(): string {
		const percent = this.seekProgressPercent();
		if (percent <= 0) return "translate(0, -50%)";
		if (percent >= 100) return "translate(-100%, -50%)";
		return "translate(-50%, -50%)";
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
