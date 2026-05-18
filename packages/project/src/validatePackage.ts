import type { ValidatePackageReport } from "./types.js";

export async function validatePackage(): Promise<ValidatePackageReport> {
	return {
		ok: true,
		checks: [],
		issues: [],
	};
}
