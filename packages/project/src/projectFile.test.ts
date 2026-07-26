import { describe, expect, it } from "vitest";
import {
	canonicalizeProjectFile,
	createStableHitId,
	deriveProjectDisplayName,
	parseProjectFile,
	serializeProjectFile,
	validateProjectFile,
} from "./projectFile.js";
import type { ChdgProjectFile } from "./projectFileTypes.js";

type MutableFixture<T> = T extends readonly (infer Item)[]
	? MutableFixture<Item>[]
	: T extends object
		? { -readonly [Key in keyof T]: MutableFixture<T[Key]> }
		: T;

type MutableProjectFixture = MutableFixture<ChdgProjectFile>;

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const CREATED_AT = "2026-07-26T10:00:00.000Z";

describe("CHDG project V1 contract", () => {
	it("parses a valid minimal self-contained project", () => {
		const result = validateProjectFile(minimalProject());

		expect(result).toEqual({
			ok: true,
			project: minimalProject(),
		});
	});

	it("parses a complete project without conflating Ride identity and target", () => {
		const project = completeProject();
		const result = validateProjectFile(project);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.sourceDocument.hits[0]?.detectedPiece).toBe("ride");
			expect(
				result.project.import.sourceMappings["gpif:ride"]?.defaultTarget,
			).toEqual({ lane: "green", cymbal: true });
			expect(result.project.corrections["gpif:0:0:0:0:0:ride"]?.piece).toBe(
				"tom_floor",
			);
			expect(result.project.corrections["gpif:0:0:0:0:0:ride"]?.target).toEqual(
				{ lane: "blue", cymbal: false },
			);
			expect(result.project.sourceDocument.hits[0]?.source).toEqual({
				kind: "gpif",
				trackIndex: 0,
				trackName: "Drums",
				articulationKey: "ride",
				rawArticulation: "Ride",
				noteName: "Ride",
				inputMidiNumbers: [51],
				outputMidiNumber: 51,
				resolvedVia: "articulation",
				measureIndex: 0,
				beatIndex: 0,
				noteIndex: 0,
			});
		}
	});

	it("derives the human project name from mandatory identity", () => {
		expect(
			deriveProjectDisplayName({
				artist: "Paramore",
				songName: "Decode",
				projectName: "Studio GP",
			}),
		).toBe("Paramore - Decode - Studio GP");
	});

	it("rejects every missing or blank mandatory identity field", () => {
		for (const field of ["projectId", "artist", "songName", "projectName"] as const) {
			const project = minimalProject() as unknown as Record<string, unknown>;
			const identity = {
				...(project["project"] as Record<string, unknown>),
				[field]: " ",
			};

			expectInvalid(
				validateProjectFile({ ...project, project: identity }),
				"INVALID_PROJECT_IDENTITY",
			);
		}
	});

	it("uses canonical OpenSpec wire names", () => {
		const result = parseProjectFile(JSON.stringify(minimalProject()));

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.project.projectId).toBe("project-demo");
			expect(result.project.sourceDocument.resolution).toBe(960);
		}
	});

	it("rejects provisional project.id, top-level projectId, and chart aliases", () => {
		const canonical = minimalProject() as unknown as Record<string, unknown>;
		const identity = canonical["project"] as Record<string, unknown>;
		const { projectId, ...withoutProjectId } = identity;
		const { sourceDocument, ...withoutSourceDocument } = canonical;

		expectInvalid(
			validateProjectFile({
				...canonical,
				project: { ...withoutProjectId, id: projectId },
			}),
			"UNSUPPORTED_PROVISIONAL_FORMAT",
		);
		expectInvalid(
			validateProjectFile({
				...canonical,
				projectId,
			}),
			"UNSUPPORTED_PROVISIONAL_FORMAT",
		);
		expectInvalid(
			validateProjectFile({
				...withoutSourceDocument,
				chart: sourceDocument,
			}),
			"UNSUPPORTED_PROVISIONAL_FORMAT",
		);
	});

	it("canonicalizes property and record-key order and round-trips deterministically", () => {
		const project = completeProject();
		project.corrections = {
			"gpif:0:0:0:1:0:snare": {
				hitId: "gpif:0:0:0:1:0:snare",
				ghost: true,
				updatedAt: CREATED_AT,
			},
			"gpif:0:0:0:0:0:ride": {
				hitId: "gpif:0:0:0:0:0:ride",
				accent: true,
				updatedAt: CREATED_AT,
			},
		};
		const first = canonicalizeProjectFile(project);
		const parsed = parseProjectFile(first);

		expect(parsed.ok).toBe(true);
		if (parsed.ok) {
			const second = serializeProjectFile(parsed.project);
			expect(second).toBe(first);
			expect(Object.keys(JSON.parse(first))).toEqual([
				"schemaVersion",
				"appVersion",
				"project",
				"import",
				"assets",
				"sourceDocument",
				"mappings",
				"corrections",
				"editor",
				"export",
			]);
			expect(first.indexOf('"gpif:0:0:0:0:0:ride"')).toBeLessThan(
				first.indexOf('"gpif:0:0:0:1:0:snare"'),
			);
			expect(first).toContain('"projectId"');
			expect(first).toContain('"sourceDocument"');
			expect(first).not.toContain('"chart":');
			expect("id" in (JSON.parse(first) as { project: object }).project).toBe(false);
		}
	});

	it("rejects malformed JSON", () => {
		expectInvalid(parseProjectFile("{not-json"), "INVALID_PROJECT_JSON");
	});

	it("rejects unsupported schema versions", () => {
		expectInvalid(
			validateProjectFile({ ...minimalProject(), schemaVersion: 2 }),
			"UNSUPPORTED_PROJECT_VERSION",
		);
	});

	it("rejects the old provisional project shape", () => {
		expectInvalid(
			validateProjectFile({
				schemaVersion: 1,
				project: { name: "Demo", createdAt: CREATED_AT, updatedAt: CREATED_AT },
				paths: {},
				selection: { selectedTracks: [] },
				metadata: {},
				generation: { status: "not-generated" },
			}),
			"UNSUPPORTED_PROVISIONAL_FORMAT",
		);
	});
});

describe("internal asset paths", () => {
	it("accepts required relative POSIX asset paths", () => {
		const result = validateProjectFile(minimalProject());

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.assets.source.relativePath).toBe("assets/source.mid");
			expect(result.project.assets.audio.relativePath).toBe("assets/song.ogg");
		}
	});

	it.each([
		"/tmp/source.mid",
		"C:\\music\\source.mid",
		"assets/../outside.mid",
		"../assets/source.mid",
		"./assets/source.mid",
		"assets//source.mid",
	])("rejects unsafe internal path %s", (relativePath) => {
		const project = minimalProject();
		project.assets.source.relativePath = relativePath;

		expectInvalid(validateProjectFile(project), "INVALID_ASSET_PATH");
	});

	it("rejects a source original filename containing a path", () => {
		const project = minimalProject();
		project.assets.source.originalFileName = "../source.mid";

		expectInvalid(validateProjectFile(project), "INVALID_ORIGINAL_FILE_NAME");
	});

	it.each([
		"assets/source.mid\u0000",
		"assets/source.\u001fmid",
		"assets/source.mid/",
		"assets/folder/source.mid",
		"assets/source",
		"assets/song.ogg",
		"assets/album.jpg",
	])("rejects unsafe, directory-like, or colliding source path %s", (relativePath) => {
		const project = minimalProject();
		project.assets.source.relativePath = relativePath;

		expectInvalid(validateProjectFile(project), "INVALID_ASSET_PATH");
	});

	it.each(["source.mid\u0000", "source.\u001fmid", ".", "..", "source.mid/"])(
		"rejects unsafe source filename %s",
		(originalFileName) => {
			const project = minimalProject();
			project.assets.source.originalFileName = originalFileName;

			expectInvalid(validateProjectFile(project), "INVALID_ORIGINAL_FILE_NAME");
		},
	);

	it("requires the archived source extension to match the original source", () => {
		const project = minimalProject();
		project.assets.source.relativePath = "assets/source.gp";

		expectInvalid(validateProjectFile(project), "INVALID_SOURCE_ASSET");
	});
});

describe("stable imported hit identities", () => {
	it("derives stable MIDI identity independently of output target and project path", () => {
		const identity = {
			kind: "midi" as const,
			trackIndex: 1,
			channel: 9,
			tick: 480,
			midiNote: 38,
			occurrenceIndex: 0,
		};

		expect(createStableHitId(identity)).toBe("midi:1:9:480:38:0");
		expect(createStableHitId({ ...identity })).toBe("midi:1:9:480:38:0");
	});

	it("derives stable GPIF identity from source event coordinates", () => {
		expect(
			createStableHitId({
				kind: "gpif",
				trackIndex: 0,
				measureIndex: 12,
				voiceIndex: 1,
				beatIndex: 3,
				noteIndex: 2,
				articulationKey: "ride-edge",
			}),
		).toBe("gpif:0:12:1:3:2:ride-edge");
	});

	it("uses occurrence index to distinguish repeated MIDI source events", () => {
		const base = {
			kind: "midi" as const,
			trackIndex: 1,
			channel: 9,
			tick: 480,
			midiNote: 38,
		};

		expect(
			createStableHitId({ ...base, occurrenceIndex: 0 }),
		).not.toBe(createStableHitId({ ...base, occurrenceIndex: 1 }));
	});

	it("rejects duplicate hit IDs", () => {
		const duplicateId = completeProject();
		duplicateId.sourceDocument.hits[1] = {
			...duplicateId.sourceDocument.hits[1]!,
			id: duplicateId.sourceDocument.hits[0]!.id,
		};
		expectInvalid(validateProjectFile(duplicateId), "DUPLICATE_HIT_ID");
	});

	it("maps identical source identity to the same ID, making collisions duplicate IDs", () => {
		const project = completeProject();
		const identity = project.sourceDocument.hits[0]!.sourceIdentity;
		const collisionId = createStableHitId(identity);
		project.sourceDocument.hits[1] = {
			...project.sourceDocument.hits[1]!,
			id: collisionId,
			sourceIdentity: identity,
			source: project.sourceDocument.hits[0]!.source,
		};

		expect(collisionId).toBe(project.sourceDocument.hits[0]!.id);
		expectInvalid(validateProjectFile(project), "DUPLICATE_HIT_ID");
	});

	it("rejects a hit ID inconsistent with source identity", () => {
		const project = minimalProject();
		project.sourceDocument.hits[0]!.id = "midi:0:9:0:36:99";

		expectInvalid(validateProjectFile(project), "INCONSISTENT_HIT_ID");
	});

	it("rejects rich provenance inconsistent with deterministic identity", () => {
		const project = minimalProject();
		project.sourceDocument.hits[0]!.source.trackIndex = 2;

		expectInvalid(
			validateProjectFile(project),
			"INCONSISTENT_SOURCE_IDENTITY",
		);
	});

	it("rejects source-mapping counts and tracks inconsistent with imported hits", () => {
		const wrongCount = minimalProject();
		wrongCount.import.sourceMappings["midi:36"]!.count = 2;
		expectInvalid(
			validateProjectFile(wrongCount),
			"INCONSISTENT_SOURCE_MAPPING",
		);

		const wrongTrack = minimalProject();
		wrongTrack.import.selectedTrackIds = [1];
		expectInvalid(
			validateProjectFile(wrongTrack),
			"INCONSISTENT_SOURCE_IDENTITY",
		);
	});
});

describe("mapping and correction validation", () => {
	it("represents correction precedence without mutating imported hits", () => {
		const project = completeProject();
		const imported = project.sourceDocument.hits[0]!;
		const mapping = project.mappings.targetOverrides[imported.sourceMappingKey];
		const correction = project.corrections[imported.id];

		expect(imported.detectedPiece).toBe("ride");
		expect(mapping).toEqual({ lane: "green", cymbal: true });
		expect(correction).toMatchObject({
			piece: "tom_floor",
			target: { lane: "blue", cymbal: false },
		});
	});

	it("rejects a hit whose source mapping key is missing", () => {
		const project = minimalProject();
		project.sourceDocument.hits[0]!.sourceMappingKey = "midi:missing";

		expectInvalid(validateProjectFile(project), "DANGLING_SOURCE_MAPPING");
	});

	it("rejects a correction whose key or hitId is dangling", () => {
		const project = minimalProject();
		project.corrections["missing"] = {
			hitId: "missing",
			deleted: true,
			updatedAt: CREATED_AT,
		};

		expectInvalid(validateProjectFile(project), "DANGLING_CORRECTION");
	});

	it("rejects invalid musical pieces", () => {
		const project = minimalProject() as unknown as {
			sourceDocument: { hits: Array<Record<string, unknown>> };
		};
		project.sourceDocument.hits[0]!["detectedPiece"] = "cowbell";

		expectInvalid(validateProjectFile(project), "INVALID_DRUM_PIECE");
	});

	it.each([
		{ lane: "kick", cymbal: true },
		{ lane: "red", cymbal: true },
		{ lane: "yellow", cymbal: "yes" },
	])("rejects invalid Clone Hero target $lane/$cymbal", (target) => {
		const project = minimalProject() as unknown as {
			import: { sourceMappings: Record<string, { defaultTarget: unknown }> };
		};
		project.import.sourceMappings["midi:36"]!.defaultTarget = target;

		expectInvalid(validateProjectFile(project), "INVALID_CLONE_HERO_TARGET");
	});

	it("keeps musical piece independent from valid cymbal semantics", () => {
		const tom = minimalProject();
		tom.sourceDocument.hits[0]!.detectedPiece = "tom_high";
		tom.import.sourceMappings["midi:36"]!.detectedPiece = "tom_high";
		tom.import.sourceMappings["midi:36"]!.defaultTarget = {
			lane: "yellow",
			cymbal: true,
		};
		const tomResult = validateProjectFile(tom);
		expect(tomResult.ok).toBe(true);
		if (tomResult.ok) {
			expect(tomResult.project.sourceDocument.hits[0]!.detectedPiece).toBe(
				"tom_high",
			);
			expect(
				tomResult.project.import.sourceMappings["midi:36"]!.defaultTarget,
			).toEqual({ lane: "yellow", cymbal: true });
		}

		const hihat = minimalProject();
		hihat.sourceDocument.hits[0]!.detectedPiece = "hihat_closed";
		hihat.import.sourceMappings["midi:36"]!.detectedPiece = "hihat_closed";
		hihat.import.sourceMappings["midi:36"]!.defaultTarget = {
			lane: "yellow",
			cymbal: false,
		};
		const hihatResult = validateProjectFile(hihat);
		expect(hihatResult.ok).toBe(true);
		if (hihatResult.ok) {
			expect(hihatResult.project.sourceDocument.hits[0]!.detectedPiece).toBe(
				"hihat_closed",
			);
			expect(
				hihatResult.project.import.sourceMappings["midi:36"]!.defaultTarget,
			).toEqual({ lane: "yellow", cymbal: false });
		}
	});

	it.each([
		{ lane: "green", cymbal: false },
		{ lane: "green", cymbal: true },
		{ lane: "blue", cymbal: false },
	] as const)("keeps Ride identity with valid target $lane/$cymbal", (target) => {
		const project = minimalProject();
		project.sourceDocument.hits[0]!.detectedPiece = "ride";
		project.import.sourceMappings["midi:36"]!.detectedPiece = "ride";
		project.import.sourceMappings["midi:36"]!.defaultTarget = target;

		const result = validateProjectFile(project);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.sourceDocument.hits[0]!.detectedPiece).toBe("ride");
			expect(
				result.project.import.sourceMappings["midi:36"]!.defaultTarget,
			).toEqual(target);
		}
	});

	it("allows a source target override to change cymbal semantics without changing piece", () => {
		const project = completeProject();
		const hit = project.sourceDocument.hits[0]!;
		project.mappings.targetOverrides[hit.sourceMappingKey] = {
			lane: "yellow",
			cymbal: false,
		};

		const result = validateProjectFile(project);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.sourceDocument.hits[0]!.detectedPiece).toBe("ride");
			expect(result.project.mappings.targetOverrides[hit.sourceMappingKey]).toEqual({
				lane: "yellow",
				cymbal: false,
			});
		}
	});

	it("keeps kick-lane safety independent from cymbal semantics", () => {
		const musicalKickOffKick = minimalProject();
		musicalKickOffKick.import.sourceMappings["midi:36"]!.defaultTarget = {
			lane: "yellow",
			cymbal: false,
		};
		expectInvalid(
			validateProjectFile(musicalKickOffKick),
			"INVALID_PIECE_TARGET_COMBINATION",
		);

		const nonKickOnKick = minimalProject();
		nonKickOnKick.sourceDocument.hits[0]!.detectedPiece = "ride";
		nonKickOnKick.import.sourceMappings["midi:36"]!.detectedPiece = "ride";
		expectInvalid(
			validateProjectFile(nonKickOnKick),
			"INVALID_PIECE_TARGET_COMBINATION",
		);
	});

	it("enforces kick-lane safety for mapping overrides and sparse corrections", () => {
		const mappingOverride = completeProject();
		mappingOverride.mappings.targetOverrides["gpif:ride"] = {
			lane: "kick",
			cymbal: false,
		};
		expectInvalid(
			validateProjectFile(mappingOverride),
			"INVALID_PIECE_TARGET_COMBINATION",
		);

		const targetCorrection = completeProject();
		const snare = targetCorrection.sourceDocument.hits[1]!;
		targetCorrection.corrections = {
			[snare.id]: {
				hitId: snare.id,
				target: { lane: "kick", cymbal: false },
				updatedAt: CREATED_AT,
			},
		};
		expectInvalid(
			validateProjectFile(targetCorrection),
			"INVALID_PIECE_TARGET_COMBINATION",
		);

		const pieceCorrection = minimalProject();
		const kick = pieceCorrection.sourceDocument.hits[0]!;
		pieceCorrection.corrections[kick.id] = {
			hitId: kick.id,
			piece: "ride",
			updatedAt: CREATED_AT,
		};
		expectInvalid(
			validateProjectFile(pieceCorrection),
			"INVALID_PIECE_TARGET_COMBINATION",
		);
	});

	it("rejects simultaneous accent and ghost", () => {
		const project = minimalProject();
		project.corrections[project.sourceDocument.hits[0]!.id] = {
			hitId: project.sourceDocument.hits[0]!.id,
			accent: true,
			ghost: true,
			updatedAt: CREATED_AT,
		};

		expectInvalid(validateProjectFile(project), "ACCENT_GHOST_CONFLICT");
	});

	it.each([
		"detected",
		"interpretation-override",
		"piece-correction",
	] as const)(
		"rejects ghost-only correction when effective open hi-hat comes from %s",
		(source) => {
			const project = minimalProject();
			const hit = project.sourceDocument.hits[0]!;
			if (source === "detected") {
				hit.detectedPiece = "hihat_open";
				project.import.sourceMappings["midi:36"]!.detectedPiece =
					"hihat_open";
				project.import.sourceMappings["midi:36"]!.defaultTarget = {
					lane: "yellow",
					cymbal: true,
				};
			} else if (source === "interpretation-override") {
				project.mappings.interpretationOverrides["midi:36"] = {
					kind: "piece",
					piece: "hihat_open",
				};
			}
			project.corrections[hit.id] = {
				hitId: hit.id,
				...(source === "piece-correction" ? { piece: "hihat_open" as const } : {}),
				ghost: true,
				updatedAt: CREATED_AT,
			};

			expectInvalid(validateProjectFile(project), "ACCENT_GHOST_CONFLICT");
		},
	);

	it("accepts open hi-hat ghost when accent is explicitly disabled", () => {
		const project = minimalProject();
		const hit = project.sourceDocument.hits[0]!;
		hit.detectedPiece = "hihat_open";
		project.import.sourceMappings["midi:36"]!.detectedPiece = "hihat_open";
		project.import.sourceMappings["midi:36"]!.defaultTarget = {
			lane: "yellow",
			cymbal: true,
		};
		project.corrections[hit.id] = {
			hitId: hit.id,
			accent: false,
			ghost: true,
			updatedAt: CREATED_AT,
		};

		expect(validateProjectFile(project).ok).toBe(true);
	});

	it("accepts the inherited accent default for open hi-hat without a correction", () => {
		const project = minimalProject();
		project.sourceDocument.hits[0]!.detectedPiece = "hihat_open";
		project.import.sourceMappings["midi:36"]!.detectedPiece = "hihat_open";
		project.import.sourceMappings["midi:36"]!.defaultTarget = {
			lane: "yellow",
			cymbal: true,
		};

		expect(validateProjectFile(project).ok).toBe(true);
	});

	it("accepts ghost-only correction for a normal piece", () => {
		const project = completeProject();
		const hit = project.sourceDocument.hits[1]!;
		project.corrections = {
			[hit.id]: {
				hitId: hit.id,
				ghost: true,
				updatedAt: CREATED_AT,
			},
		};

		expect(validateProjectFile(project).ok).toBe(true);
	});

	it.each(["unknown", "ignored"] as const)(
		"does not invent an accent default for %s mapping with ghost-only correction",
		(status) => {
			const project = minimalProject();
			const mapping = project.import.sourceMappings["midi:36"]!;
			const hit = project.sourceDocument.hits[0]!;
			mapping.status = status;
			delete mapping.defaultTarget;
			if (status === "unknown") {
				mapping.detectedPiece = "unknown";
				hit.detectedPiece = "unknown";
			}
			project.corrections[hit.id] = {
				hitId: hit.id,
				ghost: true,
				updatedAt: CREATED_AT,
			};

			expect(validateProjectFile(project).ok).toBe(true);
		},
	);

	it("rejects persisted deleted false because restore removes the overlay", () => {
		const project = minimalProject();
		const hitId = project.sourceDocument.hits[0]!.id;
		project.corrections[hitId] = {
			hitId,
			deleted: false,
			updatedAt: CREATED_AT,
		};

		expectInvalid(validateProjectFile(project), "INVALID_CORRECTION");
	});

	it("piece-only correction does not rewrite the inherited target", () => {
		const project = completeProject();
		const hit = project.sourceDocument.hits[1]!;
		project.import.sourceMappings[hit.sourceMappingKey]!.defaultTarget = {
			lane: "blue",
			cymbal: false,
		};
		project.corrections = {
			[hit.id]: {
				hitId: hit.id,
				piece: "tom_mid",
				updatedAt: CREATED_AT,
			},
		};

		const result = validateProjectFile(project);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.corrections[hit.id]).toEqual({
				hitId: hit.id,
				piece: "tom_mid",
				updatedAt: CREATED_AT,
			});
			expect(
				result.project.import.sourceMappings[hit.sourceMappingKey]!
					.defaultTarget,
			).toEqual({ lane: "blue", cymbal: false });
		}
	});

	it("target-only correction does not change the musical piece", () => {
		const project = completeProject();
		const hit = project.sourceDocument.hits[1]!;
		project.corrections = {
			[hit.id]: {
				hitId: hit.id,
				target: { lane: "yellow", cymbal: true },
				updatedAt: CREATED_AT,
			},
		};

		const result = validateProjectFile(project);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.sourceDocument.hits[1]!.detectedPiece).toBe("snare");
			expect(result.project.corrections[hit.id]).toEqual({
				hitId: hit.id,
				target: { lane: "yellow", cymbal: true },
				updatedAt: CREATED_AT,
			});
		}
	});

	it("lets an individual piece correction resolve an otherwise unknown hit", () => {
		const project = minimalProject();
		const mapping = project.import.sourceMappings["midi:36"]!;
		mapping.status = "unknown";
		mapping.detectedPiece = "unknown";
		delete mapping.defaultTarget;
		const hit = project.sourceDocument.hits[0]!;
		hit.detectedPiece = "unknown";
		project.corrections[hit.id] = {
			hitId: hit.id,
			piece: "snare",
			updatedAt: CREATED_AT,
		};

		expect(validateProjectFile(project).ok).toBe(true);
	});
});

describe("source mapping states", () => {
	it("rejects mapped unknown pieces and unknown mappings with known pieces", () => {
		const mappedUnknown = minimalProject();
		mappedUnknown.import.sourceMappings["midi:36"]!.detectedPiece = "unknown";
		mappedUnknown.sourceDocument.hits[0]!.detectedPiece = "unknown";
		expectInvalid(validateProjectFile(mappedUnknown), "INVALID_SOURCE_MAPPING");

		const unknownKnown = minimalProject();
		const mapping = unknownKnown.import.sourceMappings["midi:36"]!;
		mapping.status = "unknown";
		delete mapping.defaultTarget;
		expectInvalid(validateProjectFile(unknownKnown), "INVALID_SOURCE_MAPPING");
	});

	it("accepts unresolved unknown and ignored source states", () => {
		const unknown = minimalProject();
		const unknownMapping = unknown.import.sourceMappings["midi:36"]!;
		unknownMapping.status = "unknown";
		unknownMapping.detectedPiece = "unknown";
		delete unknownMapping.defaultTarget;
		unknown.sourceDocument.hits[0]!.detectedPiece = "unknown";
		expect(validateProjectFile(unknown).ok).toBe(true);

		const ignored = minimalProject();
		const ignoredMapping = ignored.import.sourceMappings["midi:36"]!;
		ignoredMapping.status = "ignored";
		delete ignoredMapping.defaultTarget;
		expect(validateProjectFile(ignored).ok).toBe(true);
	});

	it("accepts piece and ignore override transitions but rejects conflicting overrides", () => {
		const unknownToPiece = minimalProject();
		const unknownMapping = unknownToPiece.import.sourceMappings["midi:36"]!;
		unknownMapping.status = "unknown";
		unknownMapping.detectedPiece = "unknown";
		delete unknownMapping.defaultTarget;
		unknownToPiece.sourceDocument.hits[0]!.detectedPiece = "unknown";
		unknownToPiece.mappings.interpretationOverrides["midi:36"] = {
			kind: "piece",
			piece: "snare",
		};
		expect(validateProjectFile(unknownToPiece).ok).toBe(true);

		const mappedToIgnored = minimalProject();
		mappedToIgnored.mappings.interpretationOverrides["midi:36"] = {
			kind: "ignore",
		};
		expect(validateProjectFile(mappedToIgnored).ok).toBe(true);

		const conflicting = minimalProject();
		conflicting.mappings.interpretationOverrides["midi:36"] = {
			kind: "ignore",
		};
		conflicting.mappings.targetOverrides["midi:36"] = {
			lane: "kick",
			cymbal: false,
		};
		expectInvalid(validateProjectFile(conflicting), "INVALID_MAPPING_STATE");
	});
});

describe("source timing and export manifest validation", () => {
	it("accepts a complete ordered tempo map with time signatures and sections", () => {
		const result = validateProjectFile(completeProject());

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.project.sourceDocument.tempos.map((tempo) => tempo.tick)).toEqual([
				0, 1920,
			]);
		}
	});

	it("requires a tempo event at tick zero", () => {
		const project = minimalProject();
		project.sourceDocument.tempos = [{ tick: 480, bpm: 120 }];

		expectInvalid(validateProjectFile(project), "MISSING_INITIAL_TEMPO");
	});

	it("rejects unsorted or duplicate timing entries", () => {
		const project = completeProject();
		project.sourceDocument.tempos = [
			{ tick: 480, bpm: 130 },
			{ tick: 0, bpm: 120 },
		];
		expectInvalid(validateProjectFile(project), "INVALID_TIMING_ORDER");

		const duplicate = completeProject();
		duplicate.sourceDocument.timeSignatures.push({
			tick: 1920,
			numerator: 3,
			denominator: 4,
		});
		expectInvalid(validateProjectFile(duplicate), "INVALID_TIMING_ORDER");
	});

	it("rejects an invalid managed-file manifest", () => {
		const project = completeProject() as unknown as {
			export: { managedFiles: Record<string, unknown> };
		};
		project.export.managedFiles["background.png"] = {
			sha256: HASH_A,
			sizeBytes: 10,
			writtenAt: CREATED_AT,
		};

		expectInvalid(validateProjectFile(project), "INVALID_EXPORT_MANIFEST");
	});

	it("rejects managed metadata without an export target", () => {
		const project = completeProject();
		delete project.export.targetDirectory;

		expectInvalid(validateProjectFile(project), "INVALID_EXPORT_MANIFEST");
	});
});

describe("hostile record keys and canonical collection order", () => {
	it("preserves a valid __proto__ source key through strict canonical round trip", () => {
		const hostileJson = JSON.stringify(minimalProject()).replaceAll(
			"midi:36",
			"__proto__",
		);
		const parsed = parseProjectFile(hostileJson);

		expect(parsed.ok).toBe(true);
		if (parsed.ok) {
			expect(
				Object.hasOwn(parsed.project.import.sourceMappings, "__proto__"),
			).toBe(true);
			expect(Object.getPrototypeOf(parsed.project.import.sourceMappings)).toBe(
				null,
			);
			const serialized = serializeProjectFile(parsed.project);
			expect(serialized).toContain('"__proto__"');
			const reparsed = parseProjectFile(serialized);
			expect(reparsed).toEqual(parsed);
		}
	});

	it.each(["constructor", "prototype", "toString"])(
		"does not let inherited-looking dangling override key %s bypass validation",
		(hostileKey) => {
			const project = minimalProject();
			Object.defineProperty(project.mappings.targetOverrides, hostileKey, {
				enumerable: true,
				value: { lane: "kick", cymbal: false },
			});

			expectInvalid(validateProjectFile(project), "DANGLING_MAPPING_OVERRIDE");
		},
	);

	it("does not drop hostile dangling correction or export keys", () => {
		const correction = minimalProject();
		Object.defineProperty(correction.corrections, "__proto__", {
			enumerable: true,
			value: {
				hitId: "__proto__",
				deleted: true,
				updatedAt: CREATED_AT,
			},
		});
		expectInvalid(validateProjectFile(correction), "DANGLING_CORRECTION");

		const exported = completeProject();
		Object.defineProperty(exported.export.managedFiles!, "toString", {
			enumerable: true,
			value: {
				sha256: HASH_A,
				sizeBytes: 1,
				writtenAt: CREATED_AT,
			},
		});
		expectInvalid(validateProjectFile(exported), "INVALID_EXPORT_MANIFEST");
	});

	it("canonicalizes duplicate/reordered selected tracks and reordered hits", () => {
		const canonical = completeProject();
		canonical.sourceDocument.hits[1]!.tick = 0;
		const reordered = completeProject();
		reordered.sourceDocument.hits[1]!.tick = 0;
		reordered.import.selectedTrackIds = [1, 0, 1, 0];
		reordered.sourceDocument.hits = [
			reordered.sourceDocument.hits[1]!,
			reordered.sourceDocument.hits[0]!,
		];

		const canonicalText = serializeProjectFile(canonical);
		const reorderedText = serializeProjectFile(reordered);

		expect(reorderedText).toBe(canonicalText);
		const parsed = parseProjectFile(reorderedText);
		expect(parsed.ok).toBe(true);
		if (parsed.ok) {
			expect(parsed.project.import.selectedTrackIds).toEqual([0, 1]);
			expect(parsed.project.sourceDocument.hits.map((hit) => hit.id)).toEqual([
				"gpif:0:0:0:0:0:ride",
				"gpif:0:0:0:1:0:snare",
			]);
			expect(serializeProjectFile(parsed.project)).toBe(canonicalText);
		}
	});
});

function minimalProject(): MutableProjectFixture {
	const sourceIdentity = {
		kind: "midi" as const,
		trackIndex: 0,
		channel: 9,
		tick: 0,
		midiNote: 36,
		occurrenceIndex: 0,
	};
	const id = "midi:0:9:0:36:0";
	return {
		schemaVersion: 1,
		appVersion: "0.1.0",
		project: {
			projectId: "project-demo",
			artist: "Artist",
			songName: "Song",
			projectName: "Project",
			createdAt: CREATED_AT,
			updatedAt: CREATED_AT,
		},
		import: {
			selectedTrackIds: [0],
			sourceMappings: {
				"midi:36": {
					key: "midi:36",
					sourceKind: "midi",
					sourceLabel: "MIDI note 36",
					detectedPiece: "kick",
					defaultTarget: { lane: "kick", cymbal: false },
					count: 1,
					confidence: "high",
					status: "mapped",
				},
			},
			importedAt: CREATED_AT,
			importerVersion: "0.1.0",
		},
		assets: {
			source: {
				relativePath: "assets/source.mid",
				originalFileName: "source.mid",
				sourceKind: "midi",
				sha256: HASH_A,
				importedAt: CREATED_AT,
			},
			audio: {
				relativePath: "assets/song.ogg",
				sha256: HASH_B,
			},
		},
		sourceDocument: {
			resolution: 960,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [
				{
					id,
					tick: 0,
					detectedPiece: "kick",
					velocity: 100,
					durationTicks: 0,
					sourceMappingKey: "midi:36",
					sourceIdentity,
					source: {
						midiNote: 36,
						trackIndex: 0,
						trackName: "Drums",
						channel: 9,
					},
				},
			],
		},
		mappings: {
			interpretationOverrides: {},
			targetOverrides: {},
		},
		corrections: {},
		editor: {
			offsetMs: 0,
		},
		export: {
			status: "never-exported",
		},
	};
}

function completeProject(): MutableProjectFixture {
	const project = minimalProject();
	project.project.album = "Album";
	project.project.year = "2026";
	project.project.genre = "Rock";
	project.project.charter = "CHDG";
	project.assets.cover = {
		relativePath: "assets/album.jpg",
		sha256: HASH_A,
	};
	project.assets.audio.durationMs = 240_000;
	project.assets.source.relativePath = "assets/source.gp";
	project.assets.source.originalFileName = "source.gp";
	(project.assets.source as { sourceKind: "gpif" }).sourceKind = "gpif";
	project.import.selectedTrackIds = [0, 1];
	project.import.sourceMappings = {
		"gpif:ride": {
			key: "gpif:ride",
			sourceKind: "gpif",
			sourceLabel: "Ride",
			detectedPiece: "ride",
			defaultTarget: { lane: "green", cymbal: true },
			count: 1,
			status: "mapped",
		},
		"gpif:snare": {
			key: "gpif:snare",
			sourceKind: "gpif",
			sourceLabel: "Snare",
			detectedPiece: "snare",
			defaultTarget: { lane: "red", cymbal: false },
			count: 1,
			confidence: "medium",
			status: "mapped",
		},
	};
	project.sourceDocument.tempos = [
		{ tick: 0, bpm: 120 },
		{ tick: 1920, bpm: 128 },
	];
	project.sourceDocument.timeSignatures = [
		{ tick: 0, numerator: 4, denominator: 4 },
		{ tick: 1920, numerator: 3, denominator: 4 },
	];
	project.sourceDocument.sections = [
		{ tick: 0, name: "Intro" },
		{ tick: 1920, name: "Verse" },
	];
	project.sourceDocument.hits = [
		{
			id: "gpif:0:0:0:0:0:ride",
			tick: 0,
			detectedPiece: "ride",
			velocity: 110,
			durationTicks: 120,
			sourceMappingKey: "gpif:ride",
			sourceIdentity: {
				kind: "gpif",
				trackIndex: 0,
				measureIndex: 0,
				voiceIndex: 0,
				beatIndex: 0,
				noteIndex: 0,
				articulationKey: "ride",
			},
			source: {
				kind: "gpif",
				trackIndex: 0,
				trackName: "Drums",
				articulationKey: "ride",
				rawArticulation: "Ride",
				noteName: "Ride",
				inputMidiNumbers: [51],
				outputMidiNumber: 51,
				resolvedVia: "articulation",
				measureIndex: 0,
				beatIndex: 0,
				noteIndex: 0,
			},
		},
		{
			id: "gpif:0:0:0:1:0:snare",
			tick: 480,
			detectedPiece: "snare",
			velocity: 92,
			durationTicks: 0,
			sourceMappingKey: "gpif:snare",
			sourceIdentity: {
				kind: "gpif",
				trackIndex: 0,
				measureIndex: 0,
				voiceIndex: 0,
				beatIndex: 1,
				noteIndex: 0,
				articulationKey: "snare",
			},
			source: {
				kind: "gpif",
				trackIndex: 0,
				trackName: "Drums",
				articulationKey: "snare",
				rawArticulation: "Snare",
				noteName: "Snare",
				inputMidiNumbers: [38],
				outputMidiNumber: 38,
				resolvedVia: "articulation",
				measureIndex: 0,
				beatIndex: 1,
				noteIndex: 0,
			},
		},
	];
	project.mappings = {
		interpretationOverrides: {
			"gpif:ride": { kind: "piece", piece: "ride" },
		},
		targetOverrides: {
			"gpif:ride": { lane: "green", cymbal: true },
		},
	};
	project.corrections = {
		"gpif:0:0:0:0:0:ride": {
			hitId: "gpif:0:0:0:0:0:ride",
			piece: "tom_floor",
			target: { lane: "blue", cymbal: false },
			accent: true,
			updatedAt: CREATED_AT,
		},
	};
	project.editor.offsetMs = 900;
	project.export = {
		status: "current",
		targetDirectory: "/Clone Hero/Songs/Artist - Song - Project",
		lastSuccessfulAt: CREATED_AT,
		fingerprints: {
			sourceDocument: HASH_A,
			mappings: HASH_B,
			corrections: HASH_A,
			metadata: HASH_B,
			audio: HASH_A,
			cover: HASH_B,
		},
		managedFiles: {
			"notes.chart": {
				sha256: HASH_A,
				sizeBytes: 1000,
				writtenAt: CREATED_AT,
			},
			"song.ini": {
				sha256: HASH_B,
				sizeBytes: 200,
				writtenAt: CREATED_AT,
			},
		},
	};
	return project;
}

function expectInvalid(
	result: ReturnType<typeof validateProjectFile>,
	code: string,
) {
	expect(result.ok).toBe(false);
	if (!result.ok) {
		expect(result.code).toBe(code);
	}
}
