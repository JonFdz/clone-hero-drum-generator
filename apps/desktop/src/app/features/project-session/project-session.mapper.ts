import type {
	ProjectMissingPathKind,
	ProjectStatePayload,
} from "../../services/desktop-bridge.service";
import type { MissingPathWarning } from "./project-session.model";

/** Builds a missing-path warning for a single missing path kind. */
export function missingPathWarning(
	kind: MissingPathWarning["kind"],
	payload: ProjectStatePayload,
): MissingPathWarning {
	if (kind === "coverImagePath") {
		return {
			kind,
			path: payload.cover?.imagePath,
			message: `Missing cover image: ${payload.cover?.imagePath ?? "unknown"}`,
		};
	}
	if (kind === "outputChartPath") {
		return {
			kind,
			path: payload.outputFiles?.chart,
			message: `Missing managed chart: ${payload.outputFiles?.chart ?? "not recorded in export manifest"}`,
		};
	}
	if (kind === "outputAudioPath") {
		return {
			kind,
			path: payload.outputFiles?.songOgg,
			message: `Missing managed audio: ${payload.outputFiles?.songOgg ?? "not recorded in export manifest"}`,
		};
	}
	return {
		kind,
		path: payload[kind],
		message: `Missing ${kind}: ${payload[kind] ?? "unknown"}`,
	};
}

/** Builds missing-path warnings for each missing path kind reported on open. */
export function toMissingPathWarnings(
	kinds: ProjectMissingPathKind[],
	payload: ProjectStatePayload,
): MissingPathWarning[] {
	return kinds.map((kind) => missingPathWarning(kind, payload));
}
