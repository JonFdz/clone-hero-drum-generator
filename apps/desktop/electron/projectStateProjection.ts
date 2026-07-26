import path from "node:path";
import {
	deriveProjectDisplayName,
	MANAGED_EXPORT_FILE,
	type ChdgProjectFile,
} from "@chdg/project";
import type { DesktopOutputStatus } from "./desktopRuntimeTypes.js";

export interface DesktopProjectIdentity {
	projectId: string;
	artist: string;
	songName: string;
	projectName: string;
	displayName: string;
}

export interface ProjectStatePayload {
	project: DesktopProjectIdentity;
	projectName: string;
	projectFilePath: string;
	sourcePath: string;
	audioPath: string;
	outputDir?: string;
	cover?: { imagePath: string };
	sourceKind: "midi" | "gpif";
	selectedTracks: number[];
	metadata: {
		name?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string;
		charter?: string;
	};
	offsetMs: number;
	sourceTiming: Pick<
		ChdgProjectFile["sourceDocument"],
		"resolution" | "tempos" | "timeSignatures" | "sections"
	>;
	generationStatus: DesktopOutputStatus;
	lastGeneratedAt?: string;
	outputFiles?: {
		chart?: string;
		songIni?: string;
		songOgg?: string;
		albumJpg?: string;
	};
}

export function projectFileToDesktopState(
	projectFilePath: string,
	project: ChdgProjectFile,
): ProjectStatePayload {
	const projectDirectory = path.dirname(projectFilePath);
	const identity = project.project;
	const displayName = deriveProjectDisplayName(identity);
	return {
		project: {
			projectId: identity.projectId,
			artist: identity.artist,
			songName: identity.songName,
			projectName: identity.projectName,
			displayName,
		},
		projectName: displayName,
		projectFilePath,
		sourcePath: path.resolve(
			projectDirectory,
			project.assets.source.relativePath,
		),
		audioPath: path.resolve(
			projectDirectory,
			project.assets.audio.relativePath,
		),
		outputDir: project.export.targetDirectory,
		cover: project.assets.cover
			? {
					imagePath: path.resolve(
						projectDirectory,
						project.assets.cover.relativePath,
					),
				}
			: undefined,
		sourceKind: project.assets.source.sourceKind,
		selectedTracks: [...project.import.selectedTrackIds],
		metadata: identityMetadata(project),
		offsetMs: project.editor.offsetMs,
		sourceTiming: {
			resolution: project.sourceDocument.resolution,
			tempos: project.sourceDocument.tempos,
			timeSignatures: project.sourceDocument.timeSignatures,
			sections: project.sourceDocument.sections,
		},
		generationStatus: desktopOutputStatus(project.export.status),
		lastGeneratedAt: project.export.lastSuccessfulAt,
		outputFiles: managedOutputFiles(project),
	};
}

function desktopOutputStatus(
	status: ChdgProjectFile["export"]["status"],
): DesktopOutputStatus {
	switch (status) {
		case "current":
			return "generated";
		case "outdated":
			return "needs-regenerate";
		case "failed":
			return "failed";
		default:
			return "not-generated";
	}
}

function identityMetadata(
	project: ChdgProjectFile,
): ProjectStatePayload["metadata"] {
	const identity = project.project;
	return {
		name: identity.songName,
		artist: identity.artist,
		...(identity.album ? { album: identity.album } : {}),
		...(identity.year ? { year: identity.year } : {}),
		...(identity.genre ? { genre: identity.genre } : {}),
		...(identity.charter ? { charter: identity.charter } : {}),
	};
}

function managedOutputFiles(
	project: ChdgProjectFile,
): ProjectStatePayload["outputFiles"] {
	const targetDirectory = project.export.targetDirectory;
	const managed = project.export.managedFiles;
	if (!targetDirectory || !managed) return undefined;
	const files: NonNullable<ProjectStatePayload["outputFiles"]> = {};
	if (managed[MANAGED_EXPORT_FILE.CHART]) {
		files.chart = path.join(targetDirectory, MANAGED_EXPORT_FILE.CHART);
	}
	if (managed[MANAGED_EXPORT_FILE.METADATA]) {
		files.songIni = path.join(targetDirectory, MANAGED_EXPORT_FILE.METADATA);
	}
	if (managed[MANAGED_EXPORT_FILE.AUDIO]) {
		files.songOgg = path.join(targetDirectory, MANAGED_EXPORT_FILE.AUDIO);
	}
	if (managed[MANAGED_EXPORT_FILE.COVER]) {
		files.albumJpg = path.join(targetDirectory, MANAGED_EXPORT_FILE.COVER);
	}
	return Object.keys(files).length > 0 ? files : undefined;
}
