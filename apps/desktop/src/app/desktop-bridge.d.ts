import type { DesktopAppInfo, DesktopHealthStatus } from "./services/desktop-bridge.service";

declare global {
  interface Window {
    chdg?: {
      getAppInfo: () => Promise<DesktopAppInfo>;
      getHealth: () => Promise<DesktopHealthStatus>;
    };
  }
}
