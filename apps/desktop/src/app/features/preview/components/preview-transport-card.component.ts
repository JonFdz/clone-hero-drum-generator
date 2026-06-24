import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	computed,
	signal,
} from "@angular/core";
import { formatTime } from "../../../services/desktop-preview-model";

@Component({
	selector: "chdg-preview-transport-card",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./preview-transport-card.component.html",
	styleUrl: "./preview-transport-card.component.css",
})
export class PreviewTransportCardComponent {
	@Input() title = "Untitled Project";
	@Input() subtitle = "Unknown artist • Expert Pro Drums";

	private readonly _currentTime = signal(0);
	private readonly _duration = signal(0);
	private readonly _isPlaying = signal(false);

	@Input() set currentTime(value: number) {
		this._currentTime.set(value);
	}
	get currentTime(): number {
		return this._currentTime();
	}

	@Input() set duration(value: number) {
		this._duration.set(value);
	}
	get duration(): number {
		return this._duration();
	}

	@Input() set isPlaying(value: boolean) {
		this._isPlaying.set(value);
	}
	get isPlaying(): boolean {
		return this._isPlaying();
	}

	@Output() playPressed = new EventEmitter<void>();
	@Output() pausePressed = new EventEmitter<void>();
	@Output() seek = new EventEmitter<number>();

	private clampToDuration(value: number): number {
		if (!Number.isFinite(value)) return 0;
		const dur = this._duration();
		if (!Number.isFinite(dur) || dur <= 0) return 0;
		return Math.min(Math.max(value, 0), dur);
	}

	readonly safeCurrentTime = computed(() =>
		this.clampToDuration(this._currentTime()),
	);

	readonly seekProgressPercent = computed(() => {
		const dur = this._duration();
		if (!Number.isFinite(dur) || dur <= 0) return 0;
		return (this.safeCurrentTime() / dur) * 100;
	});

	readonly seekThumbTransform = computed(() => {
		const percent = this.seekProgressPercent();
		if (percent <= 0) return "translate(0, -50%)";
		if (percent >= 100) return "translate(-100%, -50%)";
		return "translate(-50%, -50%)";
	});

	format(seconds: number): string {
		return formatTime(seconds);
	}

	togglePlay(): void {
		if (this._isPlaying()) this.pausePressed.emit();
		else this.playPressed.emit();
	}

	onSeek(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = Number(input.value);
		if (Number.isFinite(value)) this.seek.emit(this.clampToDuration(value));
	}

	seekBy(deltaSeconds: number): void {
		this.seek.emit(this.clampToDuration(this._currentTime() + deltaSeconds));
	}
}
