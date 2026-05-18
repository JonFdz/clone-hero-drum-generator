import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rendererIndex = path.join(__dirname, "../renderer/browser/index.html");
const preloadScript = path.join(__dirname, "preload.js");

type DesktopHealthStatus = {
  ok: boolean;
  appVersion: string;
  mode: "desktop";
  checks: {
    bridge: boolean;
  };
  message?: string;
};

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: "CHDG",
    backgroundColor: "#0d1117",
    webPreferences: {
      preload: preloadScript,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  void window.loadFile(rendererIndex);
}

app.whenReady().then(() => {
  ipcMain.handle("app:get-info", () => ({
    name: app.getName(),
    version: app.getVersion(),
    mode: "desktop" as const,
  }));

  ipcMain.handle("chdg:get-health", (): DesktopHealthStatus => ({
    ok: true,
    appVersion: app.getVersion(),
    mode: "desktop",
    checks: {
      bridge: true,
    },
    message: "Desktop bridge connected",
  }));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
