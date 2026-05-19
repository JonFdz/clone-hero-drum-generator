import { Component, type OnInit, computed, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DesktopBridgeService } from "./services/desktop-bridge.service";
import { DesktopProjectStateService } from "./services/desktop-project-state.service";
import { DesktopGenerateStateService } from "./services/desktop-generate-state.service";

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

@Component({
  selector: "chdg-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  private readonly desktopBridge = inject(DesktopBridgeService);
  private readonly projectState = inject(DesktopProjectStateService);
  private readonly generateState = inject(DesktopGenerateStateService);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { label: "Home", path: "/home", icon: "⌂" },
    { label: "Projects", path: "/projects", icon: "□" },
    { label: "New Project", path: "/new-project", icon: "+" },
    { label: "Inspect Source", path: "/inspect-source", icon: "⌕" },
    { label: "Track Selection", path: "/track-selection", icon: "♬" },
    { label: "Generate", path: "/generate", icon: "✦" },
    { label: "Validation", path: "/validation", icon: "◇" },
    { label: "Preview", path: "/preview", icon: "▷" },
    { label: "Mapping", path: "/mapping", icon: "▦" },
    { label: "Settings", path: "/settings", icon: "⚙" },
  ];

  readonly appVersion = computed(() => this.desktopBridge.appInfo()?.version ?? this.desktopBridge.health().appVersion);
  readonly health = this.desktopBridge.health;
  readonly project = this.projectState.state;

  async ngOnInit(): Promise<void> {
    void this.desktopBridge.loadStatus();
    await this.projectState.loadSettings();
    await this.projectState.loadRecentProjects();
  }

  async saveProject(): Promise<void> {
    const name = this.project().projectName;
    const filePath = this.project().projectFilePath;
    const payload = this.generateState.buildProjectStatePayload(name, filePath);
    await this.projectState.saveProject(payload);
  }

  async saveProjectAs(): Promise<void> {
    const name = this.project().projectName;
    const currentPath = this.project().projectFilePath;
    const picked = await this.desktopBridge.saveProjectFile(name, currentPath);
    if (!picked) return;
    const payload = this.generateState.buildProjectStatePayload(name, picked.path);
    const saved = await this.projectState.saveProjectAs({ ...payload, filePath: picked.path });
    if (saved) {
      // Saved
    }
  }

  async openProject(): Promise<void> {
    const picked = await this.desktopBridge.openProjectFile();
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
