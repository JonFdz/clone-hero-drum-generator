export type DesktopSettings = {
	schemaVersion: number;
	theme: "dark";
	accentColor?: string;
	projectLocation: string;
	defaultOutputFolder?: string;
	defaultCharter?: string;
	defaultOffsetMs?: number;
	ffmpegPath?: string;
};

export type RecentProject = {
	path: string;
	name: string;
	lastOpenedAt: string;
};
