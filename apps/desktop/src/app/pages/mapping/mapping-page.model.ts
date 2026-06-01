import type {
	MappingCandidate,
	ProjectMappingOverrides,
} from "@chdg/project/browser";

export type MappingRow = {
	key: string;
	sourceKind: "midi" | "gpif";
	sourceValue: string;
	label?: string;
	noteName?: string;
	action?: "map" | "candidate" | "ignore" | "unknown";
	automaticPiece?: string;
	suggestedPiece?: string;
	confidence?: string;
	family?: string;
	reason?: string;
	count?: number;
	firstTick?: number;
	status: "default" | "override" | "existing-override";
};

export function buildMappingRows(
	candidates: MappingCandidate[] | undefined,
	overrides: ProjectMappingOverrides,
): MappingRow[] {
	const rows = new Map<string, MappingRow>();
	for (const candidate of candidates ?? []) {
		rows.set(candidate.key, {
			key: candidate.key,
			sourceKind: candidate.sourceKind,
			sourceValue: candidate.sourceValue,
			label: candidate.label,
			noteName: candidate.noteName,
			action: candidate.action,
			automaticPiece: candidate.automaticPiece,
			suggestedPiece: candidate.suggestedPiece,
			confidence: candidate.confidence,
			family: candidate.family,
			reason: candidate.reason,
			count: candidate.count,
			firstTick: candidate.firstTick,
			status: overrides[candidate.key] ? "override" : "default",
		});
	}
	for (const [key, override] of Object.entries(overrides)) {
		if (rows.has(key)) continue;
		rows.set(key, {
			key,
			sourceKind: override.sourceKind,
			sourceValue: override.key,
			status: "existing-override",
		});
	}
	return Array.from(rows.values()).sort((a, b) => a.key.localeCompare(b.key));
}
