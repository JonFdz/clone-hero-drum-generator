import type { DrumHit, DrumPiece } from "@chdg/core";

export type MappingOverrideTarget =
	| { kind: "piece"; piece: Exclude<DrumPiece, "unknown"> }
	| { kind: "ignore" };

export type ProjectMappingOverride = {
	sourceKind: "midi" | "gpif";
	key: string;
	target: MappingOverrideTarget;
	label?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type ProjectMappingOverrides = Record<string, ProjectMappingOverride>;

export function buildMappingOverrideKeyFromHit(hit: DrumHit): string | undefined {
	if ("midiNote" in hit.source) {
		return `midi:${hit.source.midiNote}`;
	}
	const raw = hit.source.rawArticulation?.trim();
	if (raw) {
		return `gpif:${raw.toLowerCase()}`;
	}
	return undefined;
}

export function applyProjectMappingOverrides(
	hits: DrumHit[],
	overrides: ProjectMappingOverrides | undefined,
): DrumHit[] {
	if (!overrides || Object.keys(overrides).length === 0) {
		return hits;
	}

	const next: DrumHit[] = [];
	for (const hit of hits) {
		const key = buildMappingOverrideKeyFromHit(hit);
		const override = key ? overrides[key] : undefined;
		if (!override) {
			next.push(hit);
			continue;
		}
		if (override.target.kind === "ignore") {
			continue;
		}
		next.push({
			...hit,
			piece: override.target.piece,
		});
	}
	return next;
}

export function validateMappingOverrides(
	value: unknown,
): ProjectMappingOverrides {
	if (value === undefined) {
		return {};
	}
	if (!isRecord(value)) {
		return {};
	}
	const valid: ProjectMappingOverrides = {};
	for (const [key, candidate] of Object.entries(value)) {
		if (!isRecord(candidate)) continue;
		const sourceKind = candidate["sourceKind"];
		if (sourceKind !== "midi" && sourceKind !== "gpif") continue;
		const sourceKey = candidate["key"];
		if (typeof sourceKey !== "string" || sourceKey.trim().length === 0) continue;
		const target = candidate["target"];
		if (!isRecord(target)) continue;
		if (target["kind"] === "ignore") {
			valid[key] = {
				sourceKind,
				key: sourceKey,
				target: { kind: "ignore" },
				label: optionalString(candidate["label"]),
				createdAt: optionalString(candidate["createdAt"]),
				updatedAt: optionalString(candidate["updatedAt"]),
			};
			continue;
		}
		if (
			target["kind"] === "piece" &&
			typeof target["piece"] === "string" &&
			isSupportedPiece(target["piece"])
		) {
			valid[key] = {
				sourceKind,
				key: sourceKey,
				target: { kind: "piece", piece: target["piece"] },
				label: optionalString(candidate["label"]),
				createdAt: optionalString(candidate["createdAt"]),
				updatedAt: optionalString(candidate["updatedAt"]),
			};
		}
	}
	return valid;
}

function isSupportedPiece(piece: string): piece is Exclude<DrumPiece, "unknown"> {
	return [
		"kick",
		"snare",
		"hihat_closed",
		"hihat_open",
		"crash",
		"ride",
		"tom_high",
		"tom_mid",
		"tom_floor",
	].includes(piece);
}

function optionalString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
