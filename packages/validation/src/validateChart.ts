import type { DrumChart } from "@chdg/core";
export type ValidationIssue = { severity: "warning" | "error"; message: string; tick?: number };
export function validateDrumChart(chart: DrumChart): ValidationIssue[] { const issues: ValidationIssue[] = []; if (chart.expertDrums.length === 0) issues.push({ severity: "warning", message: "ExpertDrums has no notes." }); return issues; }
