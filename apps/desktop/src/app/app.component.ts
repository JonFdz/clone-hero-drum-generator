import { Component, type OnInit, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DesktopBridgeService } from "./services/desktop-bridge.service";

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

  ngOnInit(): void {
    void this.desktopBridge.loadStatus();
  }
}
