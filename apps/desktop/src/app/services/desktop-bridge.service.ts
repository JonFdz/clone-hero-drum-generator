import { Injectable, signal } from "@angular/core";

export type DesktopAppInfo = {
  name: string;
  version: string;
  mode: "desktop";
};

export type DesktopHealthStatus = {
  ok: boolean;
  appVersion: string;
  mode: "desktop";
  checks: {
    bridge: boolean;
  };
  message?: string;
};

const unavailableHealth: DesktopHealthStatus = {
  ok: false,
  appVersion: "unknown",
  mode: "desktop",
  checks: {
    bridge: false,
  },
  message: "Desktop bridge unavailable",
};

@Injectable({ providedIn: "root" })
export class DesktopBridgeService {
  readonly appInfo = signal<DesktopAppInfo | null>(null);
  readonly health = signal<DesktopHealthStatus>(unavailableHealth);

  async loadStatus(): Promise<void> {
    const bridge = window.chdg;

    if (!bridge) {
      this.health.set(unavailableHealth);
      return;
    }

    try {
      const [appInfo, health] = await Promise.all([
        bridge.getAppInfo(),
        bridge.getHealth(),
      ]);

      this.appInfo.set(appInfo);
      this.health.set(health);
    } catch (error) {
      this.health.set({
        ...unavailableHealth,
        message: error instanceof Error ? error.message : unavailableHealth.message,
      });
    }
  }
}
