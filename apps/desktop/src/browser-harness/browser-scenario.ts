import type {
	ChdgSourceFingerprint,
	NormalizationPreview,
	SourceInspectionResult,
} from "@chdg/project/browser";
import type { ProjectStatePayload } from "../app/services/desktop-bridge.service";

export const GENERATION_SEED = {
	READY: "ready",
	RUNNING: "running",
	FAILED: "failed",
} as const;

export type BrowserGenerationSeed =
	(typeof GENERATION_SEED)[keyof typeof GENERATION_SEED];

export interface BrowserHarnessScenario {
	id: BrowserScenarioId;
	description: string;
	recommendedRoute: string;
	project?: ProjectStatePayload;
	generationSeed?: BrowserGenerationSeed;
	sourceFingerprint?: ChdgSourceFingerprint;
	inspection?: SourceInspectionResult;
	normalization?: NormalizationPreview;
}

export type BrowserScenarioId =
	(typeof import("./scenario-registry").BROWSER_SCENARIO_IDS)[number];
