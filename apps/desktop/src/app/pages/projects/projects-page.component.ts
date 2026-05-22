import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";

@Component({
  selector: "chdg-projects-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="page-header">
      <p class="eyebrow">Projects</p>
      <h1>Project library</h1>
      <p>Open a recent project or browse for a .chdg file.</p>
    </header>

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
  `,
  styles: [`
    .project-card { cursor: pointer; }
    .project-card:hover { background: rgba(151, 83, 229, 0.12); }
    .path-text { color: var(--color-muted); font-size: 0.85rem; word-break: break-all; }
  `]
})
export class ProjectsPageComponent {
  private readonly projectState = inject(DesktopProjectStateService);
  private readonly bridge = inject(DesktopBridgeService);
  private readonly generateState = inject(DesktopGenerateStateService);
  private readonly router = inject(Router);

  get recentProjects() {
    return this.projectState.state().recentProjects;
  }

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
        mappingOverrides: payload.mappingOverrides,
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
        mappingOverrides: payload.mappingOverrides,
      });
      await this.router.navigateByUrl("/new-project");
    }
  }
}
