import type { ProjectMappingOverrides } from "./mappingOverrides.js";
import { validateMappingOverrides } from "./mappingOverrides.js";

export type MappingOverrideProfile = {
	id: string;
	name: string;
	description?: string;
	sourceKind?: "midi" | "gpif";
	overrides: ProjectMappingOverrides;
	createdAt: string;
	updatedAt: string;
};

export type MappingOverrideProfileStore = {
	schemaVersion: 1;
	profiles: MappingOverrideProfile[];
};

export type MappingProfileApplyMode = "replace" | "merge";

export function validateMappingOverrideProfile(
	value: unknown,
): MappingOverrideProfile | undefined {
	if (!isRecord(value)) return undefined;
	const id = optionalTrimmedString(value["id"]);
	const name = optionalTrimmedString(value["name"]);
	const createdAt = optionalString(value["createdAt"]);
	const updatedAt = optionalString(value["updatedAt"]);
	if (!id || !name || !createdAt || !updatedAt) return undefined;
	const sourceKind = value["sourceKind"];
	if (sourceKind !== undefined && sourceKind !== "midi" && sourceKind !== "gpif") {
		return undefined;
	}
	return {
		id,
		name,
		description: optionalString(value["description"]),
		sourceKind,
		overrides: validateMappingOverrides(value["overrides"]),
		createdAt,
		updatedAt,
	};
}

export function validateMappingOverrideProfileStore(
	value: unknown,
): MappingOverrideProfileStore {
	if (!isRecord(value) || value["schemaVersion"] !== 1 || !Array.isArray(value["profiles"])) {
		return { schemaVersion: 1, profiles: [] };
	}
	return {
		schemaVersion: 1,
		profiles: value["profiles"]
			.map((profile) => validateMappingOverrideProfile(profile))
			.filter((profile): profile is MappingOverrideProfile => Boolean(profile)),
	};
}

export function applyMappingProfile(input: {
	projectOverrides: ProjectMappingOverrides;
	profileOverrides: ProjectMappingOverrides;
	mode: MappingProfileApplyMode;
}): {
	overrides: ProjectMappingOverrides;
	summary: { added: number; replaced: number; kept: number; removed?: number };
} {
	const projectEntries = Object.entries(input.projectOverrides);
	const profileEntries = Object.entries(input.profileOverrides);
	if (input.mode === "replace") {
		return {
			overrides: { ...input.profileOverrides },
			summary: {
				added: profileEntries.length,
				replaced: 0,
				kept: 0,
				removed: projectEntries.length,
			},
		};
	}
	const merged: ProjectMappingOverrides = { ...input.projectOverrides };
	let added = 0;
	let replaced = 0;
	for (const [key, override] of profileEntries) {
		if (merged[key]) {
			replaced += 1;
		} else {
			added += 1;
		}
		merged[key] = override;
	}
	return {
		overrides: merged,
		summary: {
			added,
			replaced,
			kept: Math.max(0, projectEntries.length - replaced),
		},
	};
}

function optionalTrimmedString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function optionalString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
