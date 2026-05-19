import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import type { FfmpegDiagnostic } from "../../services/desktop-bridge.service";

@Component({
  selector: "chdg-settings-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <p class="eyebrow">Settings</p>
      <h1>Settings</h1>
      <p>Configure local app behavior. Settings persist across app restarts.</p>
    </header>

    <div class="grid two">
      <section class="card">
        <h2>General</h2>
        <div class="setting-row">
          <div><strong>Theme</strong><p>Light mode can be added in a future update.</p></div>
          <span class="input-like">Dark</span>
        </div>
        <div class="setting-row">
          <div><strong>Accent color</strong><p>Purple accent matches the Phase 10 visual direction.</p></div>
          <span class="pill">Purple</span>
        </div>
        <div class="setting-row">
          <div><strong>Default project location</strong><p>Folder where new projects are created by default.</p></div>
          <input class="input-like" [(ngModel)]="settings.projectLocation" (change)="save()" />
        </div>
        <div class="setting-row">
          <div><strong>Default output folder</strong><p>Optional override for the default output folder inside each project.</p></div>
          <input class="input-like" [(ngModel)]="settings.defaultOutputFolder" (change)="save()" placeholder="<project>/output" />
        </div>
        <div class="setting-row">
          <div><strong>Default charter</strong><p>Default charter name for new projects.</p></div>
          <input class="input-like" [(ngModel)]="settings.defaultCharter" (change)="save()" />
        </div>
        <div class="setting-row">
          <div><strong>Default offset (ms)</strong><p>Default chart offset in milliseconds.</p></div>
          <input class="input-like" type="number" [(ngModel)]="settings.defaultOffsetMs" (change)="save()" />
        </div>
      </section>

      <section class="card">
        <h2>Diagnostics</h2>
        <div class="setting-row">
          <div><strong>FFmpeg path</strong><p>Path to FFmpeg binary. Leave empty to detect from PATH.</p></div>
          <div class="column">
            <input class="input-like" [(ngModel)]="settings.ffmpegPath" (change)="save()" placeholder="Auto-detect from PATH" />
            <button class="button secondary small" type="button" (click)="testFfmpeg()">Test FFmpeg</button>
            @if (ffmpegResult(); as result) {
              <p class="ffmpeg-result" [class.available]="result.available">{{ result.message }}</p>
            }
          </div>
        </div>
        <div class="setting-row">
          <div><strong>Backend Status</strong><p>Provided through the secure preload bridge.</p></div>
          <span class="pill">Connected</span>
        </div>
        <div class="setting-row">
          <div><strong>Local-only / Offline</strong><p>No internet required.</p></div>
          <span class="pill">Enabled</span>
        </div>
        <div class="setting-row">
          <div><strong>Project Format</strong><p>Future project file extension.</p></div>
          <span class="input-like">.chdg</span>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .column { display: flex; flex-direction: column; gap: var(--space-2); align-items: flex-start; }
    .ffmpeg-result { color: #ff6b6b; font-size: 0.85rem; }
    .ffmpeg-result.available { color: #65de77; }
  `]
})
export class SettingsPageComponent {
  private readonly projectState = inject(DesktopProjectStateService);
  readonly settings = this.projectState.state().settings;
  readonly ffmpegResult = signal<FfmpegDiagnostic | null>(null);

  async save(): Promise<void> {
    await this.projectState.saveSettings(this.settings);
  }

  async testFfmpeg(): Promise<void> {
    const result = await this.projectState.testFfmpeg(this.settings.ffmpegPath ?? "");
    this.ffmpegResult.set(result);
  }
}
