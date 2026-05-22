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
	// Project persistence
	saveProjectFile: (projectName: string, currentPath?: string) =>
		ipcRenderer.invoke("dialog:save-project-file", projectName, currentPath),
	openProjectFile: () => ipcRenderer.invoke("dialog:open-project-file"),
	createProject: (input: unknown) =>
		ipcRenderer.invoke("chdg:create-project", input),
	saveProject: (input: unknown) =>
		ipcRenderer.invoke("chdg:save-project", input),
	saveProjectAs: (input: unknown) =>
		ipcRenderer.invoke("chdg:save-project-as", input),
	openProject: (filePath: string) =>
		ipcRenderer.invoke("chdg:open-project", filePath),
	readRecentProjects: () => ipcRenderer.invoke("chdg:read-recent-projects"),
	removeRecentProject: (projectPath: string) =>
		ipcRenderer.invoke("chdg:remove-recent-project", projectPath),
	readSettings: () => ipcRenderer.invoke("chdg:read-settings"),
	writeSettings: (settings: unknown) =>
		ipcRenderer.invoke("chdg:write-settings", settings),
	readMappingProfiles: () => ipcRenderer.invoke("chdg:read-mapping-profiles"),
	saveMappingProfile: (profile: unknown) =>
		ipcRenderer.invoke("chdg:save-mapping-profile", profile),
	deleteMappingProfile: (profileId: string) =>
		ipcRenderer.invoke("chdg:delete-mapping-profile", profileId),
	testFfmpeg: (input: string) => ipcRenderer.invoke("chdg:test-ffmpeg", input),
	getAudioPreviewSource: (input: unknown) =>
		ipcRenderer.invoke("chdg:get-audio-preview-source", input),
	getChartPreviewData: (input: unknown) =>
		ipcRenderer.invoke("chdg:get-chart-preview-data", input),
	applyChartOffset: (input: unknown) =>
		ipcRenderer.invoke("chdg:apply-chart-offset", input),
};

contextBridge.exposeInMainWorld("chdg", api);
