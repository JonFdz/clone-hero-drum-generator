import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, linkedSignal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { DesktopSettings } from "@chdg/project/browser";
import { SettingsService } from "./settings.service";

@Component({
  selector: "chdg-settings-page",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
	templateUrl: "./settings-page.component.html",
	styleUrl: "./settings-page.component.css",
})
export class SettingsPageComponent {
  private readonly settingsService = inject(SettingsService);
  readonly settings = linkedSignal(() => ({ ...this.settingsService.settings() }));
  readonly ffmpegResult = this.settingsService.ffmpegDiagnostic;

  updateSettings(patch: Partial<DesktopSettings>): void {
    this.settings.update((settings) => ({ ...settings, ...patch }));
  }

  async save(): Promise<void> {
    await this.settingsService.save(this.settings());
  }

  async testFfmpeg(): Promise<void> {
    await this.settingsService.testFfmpeg(this.settings().ffmpegPath ?? "");
  }
}
