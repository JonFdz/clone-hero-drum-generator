import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";

@Component({
  selector: "chdg-home-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="page-header">
      <p class="eyebrow">Local desktop shell</p>
      <h1>Welcome to CHDG.</h1>
      <p>Build Clone Hero drum packages from local MIDI and Guitar Pro / GPIF sources.</p>
    </header>

    <div class="grid two">
      <section class="card">
        <h2>Recent Projects</h2>
        @if (recentProjects.length === 0) {
          <p>No recent projects. Create a new project to get started.</p>
        } @else {
          <div class="card-list">
            @for (project of recentProjects; track project.path) {
              <div class="mini-card project-card" (click)="openRecent(project.path)">
                <div class="split-row">
                  <strong>{{ project.name }}</strong>
                  <button class="button ghost small" type="button" (click)="removeRecent($event, project.path)">Remove</button>
                </div>
                <p class="path-text">{{ project.path }}</p>
              </div>
            }
          </div>
        }
        <div class="action-row">
          <a class="button primary" routerLink="/new-project">New Project</a>
          <button class="button secondary" type="button" (click)="openProject()">Open Project</button>
        </div>
      </section>

      <section class="card">
        <h2>Workflow overview</h2>
        <div class="workflow" aria-label="Planned desktop workflow">
          @for (step of workflow; track step.label) {
            <div class="workflow-step">
              <div class="step-icon" aria-hidden="true">{{ step.icon }}</div>
              <strong>{{ step.label }}</strong>
              <p>{{ step.description }}</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .project-card { cursor: pointer; }
    .project-card:hover { background: rgba(151, 83, 229, 0.12); }
    .path-text { color: var(--color-muted); font-size: 0.85rem; word-break: break-all; }
  `]
})
export class HomePageComponent {
  private readonly projectState = inject(DesktopProjectStateService);
  private readonly bridge = inject(DesktopBridgeService);
  private readonly generateState = inject(DesktopGenerateStateService);
  private readonly router = inject(Router);

  get recentProjects() {
    return this.projectState.state().recentProjects;
  }

  readonly workflow = [
    { icon: "↓", label: "Import source", description: "Use local .mid, .midi, or .gp / GPIF files." },
    { icon: "⌕", label: "Inspect", description: "Review source structure before generation." },
    { icon: "♬", label: "Select track(s)", description: "Choose drum candidates in a future phase." },
    { icon: "✦", label: "Generate", description: "Create the Clone Hero song folder later." },
    { icon: "◇", label: "Validate", description: "Check generated package consistency." },
    { icon: "▷", label: "Preview", description: "Review notes.chart with song.ogg in future phases." },
  ];

  async openRecent(filePath: string): Promise<void> {
    const payload = await this.projectState.openProject(filePath);
    if (payload) {
      this.generateState.loadProjectState({
        sourcePath: payload.sourcePath,
        audioPath: payload.audioPath,
        outputDir: payload.outputDir,
        sourceKind: payload.sourceKind,
        selectedTracks: payload.selectedTracks,
        metadata: payload.metadata,
        offsetMs: payload.offsetMs,
        lastGeneratedAt: payload.lastGeneratedAt,
        outputFiles: payload.outputFiles,
      });
      await this.router.navigateByUrl("/new-project");
    }
  }

  async removeRecent(event: Event, filePath: string): Promise<void> {
    event.stopPropagation();
    await this.projectState.removeRecentProject(filePath);
  }

  async openProject(): Promise<void> {
    const picked = await this.bridge.openProjectFile();
    if (!picked) return;
    const payload = await this.projectState.openProject(picked.path);
    if (payload) {
      this.generateState.loadProjectState({
        sourcePath: payload.sourcePath,
        audioPath: payload.audioPath,
        outputDir: payload.outputDir,
        sourceKind: payload.sourceKind,
        selectedTracks: payload.selectedTracks,
        metadata: payload.metadata,
        offsetMs: payload.offsetMs,
        lastGeneratedAt: payload.lastGeneratedAt,
        outputFiles: payload.outputFiles,
      });
      await this.router.navigateByUrl("/new-project");
    }
  }
}
