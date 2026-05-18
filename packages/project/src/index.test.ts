import { describe, expect, it } from "vitest";
import * as project from "./index.js";

describe("@chdg/project exports", () => {
	it("exports phase 10A service functions", () => {
		expect(typeof project.inspectSource).toBe("function");
		expect(typeof project.normalizeSelection).toBe("function");
		expect(typeof project.generatePackage).toBe("function");
	});
});
