import { describe, expect, it } from "vitest";
import { buildMappingRows } from "./mapping.model";

describe("buildMappingRows", () => {
	it("returns candidate-only and candidate+override rows", () => {
		const rows = buildMappingRows(
			[
				{
					key: "midi:37",
					sourceKind: "midi",
					sourceValue: "37",
					automaticPiece: "unknown",
					count: 12,
				},
			],
			{
				"midi:37": {
					sourceKind: "midi",
					key: "midi:37",
					target: { kind: "piece", piece: "snare" },
				},
			},
		);
		expect(rows).toHaveLength(1);
		expect(rows[0].status).toBe("override");
	});

	it("keeps override-only rows visible for reset", () => {
		const rows = buildMappingRows(undefined, {
			"gpif:side stick": {
				sourceKind: "gpif",
				key: "gpif:side stick",
				target: { kind: "ignore" },
			},
		});
		expect(rows).toHaveLength(1);
		expect(rows[0].key).toBe("gpif:side stick");
		expect(rows[0].status).toBe("existing-override");
	});

	it("returns empty array when no candidates and no overrides", () => {
		expect(buildMappingRows(undefined, {})).toEqual([]);
	});

	it("sorts rows by key", () => {
		const rows = buildMappingRows(
			[
				{ key: "midi:50", sourceKind: "midi", sourceValue: "50" },
				{ key: "midi:36", sourceKind: "midi", sourceValue: "36" },
			],
			{},
		);
		expect(rows[0].key).toBe("midi:36");
		expect(rows[1].key).toBe("midi:50");
	});
});
