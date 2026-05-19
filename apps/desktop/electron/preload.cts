import { contextBridge, ipcRenderer } from "electron";

const api = {
	getAppInfo: () => ipcRenderer.invoke("app:get-info"),
	getHealth: () => ipcRenderer.invoke("chdg:get-health"),
	pickSourceFile: () => ipcRenderer.invoke("dialog:pick-source-file"),
	pickAudioFile: () => ipcRenderer.invoke("dialog:pick-audio-file"),
	pickOutputFolder: () => ipcRenderer.invoke("dialog:pick-output-folder"),
	inspectSource: (input: unknown) =>
		ipcRenderer.invoke("chdg:inspect-source", input),
	normalizeSelection: (input: unknown) =>
		ipcRenderer.invoke("chdg:normalize-selection", input),
	generatePackage: (input: unknown) =>
		ipcRenderer.invoke("chdg:generate-package", input),
	openOutputFolder: (folderPath: string) =>
		ipcRenderer.invoke("shell:open-output-folder", folderPath),
};

contextBridge.exposeInMainWorld("chdg", api);
