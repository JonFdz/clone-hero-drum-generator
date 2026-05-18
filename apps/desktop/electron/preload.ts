import { contextBridge, ipcRenderer } from "electron";

const api = {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  getHealth: () => ipcRenderer.invoke("chdg:get-health"),
};

contextBridge.exposeInMainWorld("chdg", api);
