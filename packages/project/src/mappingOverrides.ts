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

export type MappingCandidateSourceKind = "midi" | "gpif";

export type MappingCandidate = {
	key: string;
	sourceKind: MappingCandidateSourceKind;
	sourceValue: string;
	label?: string;
	automaticPiece: DrumHit["piece"];
	count: number;
	firstTick?: number;
};

export function buildMappingOverrideKeyFromHit(hit: DrumHit): string | undefined {
	if ("midiNote" in hit.source) {
		return buildMidiOverrideKey(hit.source.midiNote);
	}
	const raw = hit.source.rawArticulation?.trim();
	if (raw) {
		return buildGpifOverrideKey(raw);
	}
	return undefined;
}

export function buildMidiOverrideKey(noteNumber: number): string {
	return `midi:${noteNumber}`;
}

export function buildGpifOverrideKey(rawArticulation: string): string {
	return `gpif:${rawArticulation.trim().toLowerCase()}`;
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

export function buildMappingCandidates(hits: DrumHit[]): MappingCandidate[] {
	const byKey = new Map<string, MappingCandidate>();
	for (const hit of hits) {
		const key = buildMappingOverrideKeyFromHit(hit);
		if (!key) continue;
		const existing = byKey.get(key);
		if (existing) {
			existing.count += 1;
			if (existing.firstTick === undefined || hit.tick < existing.firstTick) {
				existing.firstTick = hit.tick;
			}
			continue;
		}
		if ("midiNote" in hit.source) {
			byKey.set(key, {
				key,
				sourceKind: "midi",
				sourceValue: String(hit.source.midiNote),
				label: `Note ${hit.source.midiNote}`,
				automaticPiece: hit.piece,
				count: 1,
				firstTick: hit.tick,
			});
			continue;
		}
		const raw = hit.source.rawArticulation?.trim();
		byKey.set(key, {
			key,
			sourceKind: "gpif",
			sourceValue: raw ?? key.replace("gpif:", ""),
			label: raw,
			automaticPiece: hit.piece,
			count: 1,
			firstTick: hit.tick,
		});
	}
	return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function hasPieceOverrideForMidiNote(
	overrides: ProjectMappingOverrides | undefined,
	noteNumber: number,
): boolean {
	const key = buildMidiOverrideKey(noteNumber);
	return overrides?.[key]?.target.kind === "piece";
}

export function hasPieceOverrideForGpifArticulation(
	overrides: ProjectMappingOverrides | undefined,
	rawArticulation: string,
): boolean {
	const key = buildGpifOverrideKey(rawArticulation);
	return overrides?.[key]?.target.kind === "piece";
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
