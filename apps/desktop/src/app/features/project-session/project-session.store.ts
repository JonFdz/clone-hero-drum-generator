import { Injectable, computed, signal } from "@angular/core";
import type { DesktopOutputStatus } from "../../services/desktop-project-runtime";
import {
	type MissingPathWarning,
	type ProjectSessionState,
	initialProjectSessionState,
} from "./project-session.model";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";

/**
 * Signal-based store for the active project session.
 *
 * Holds only the identity and status of the project currently being edited
 * (file path, name, dirty flag, output status, missing-path warnings). Workflow
 * state owned by the generation feature (#76) is not moved here yet; that
 * consolidation is recorded in the architecture follow-up register.
 */
@Injectable({ providedIn: "root" })
export class ProjectSessionStore {
	readonly state = signal<ProjectSessionState>(initialProjectSessionState);

	readonly project = computed(() => this.state().project);
	readonly projectFilePath = computed(() => this.state().projectFilePath);
	readonly projectName = computed(() => this.state().projectName);
	readonly hasProject = computed(
		() =>
			this.state().projectName !== "Untitled" ||
			!!this.state().projectFilePath,
	);
	readonly isDirty = computed(() => this.state().dirty);
	readonly outputStatus = computed<DesktopOutputStatus>(
		() => this.state().outputStatus,
	);
	readonly missingPathWarnings = computed(
		() => this.state().missingPaths,
	);

	/** Hydrates project identity/status from a persistence payload. */
	applyHydration(payload: ProjectStatePayload): void {
		this.patch({
			project: payload.project,
			projectName: payload.projectName,
			projectFilePath: payload.projectFilePath,
			outputStatus: payload.generationStatus,
			dirty: false,
		});
	}

	markDirty(): void {
		this.patch({ dirty: true });
	}

	markNeedsRegenerate(): void {
		if (this.state().outputStatus === "generated") {
			this.patch({ outputStatus: "needs-regenerate", dirty: true });
		} else {
			this.patch({ dirty: true });
		}
	}

	markGenerated(): void {
		this.patch({ outputStatus: "generated", dirty: true });
	}

	markFailed(): void {
		this.patch({ outputStatus: "failed", dirty: true });
	}

	setProjectName(name: string): void {
		this.patch({ projectName: name, dirty: true });
	}

	setProjectFilePath(filePath: string): void {
		this.patch({ projectFilePath: filePath });
	}

	setMissingPaths(warnings: MissingPathWarning[]): void {
		this.patch({ missingPaths: warnings });
	}

	clearMissingPaths(): void {
		this.patch({ missingPaths: [] });
	}

	/** Resets only active-project state. Recents/settings live elsewhere and are untouched. */
	resetActiveProject(): void {
		this.state.set(initialProjectSessionState);
	}

	private patch(patch: Partial<ProjectSessionState>): void {
		this.state.update((state) => ({ ...state, ...patch }));
	}
}
