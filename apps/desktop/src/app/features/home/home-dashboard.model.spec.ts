import type { RecentProject } from "@chdg/project/browser";
import { describe, expect, it } from "vitest";
import {
  deriveHomeDashboardModel,
  deriveHomeNextAction,
  deriveWorkflowStepStatuses,
  formatHomeOutputStatus,
  type HomeDashboardModelInput,
  limitRecentProjects,
} from "./home-dashboard.model";

function input(overrides: Partial<HomeDashboardModelInput> = {}): HomeDashboardModelInput {
  return {
    projectName: "Demo",
    outputStatus: "not-generated",
    missingPathWarnings: [],
    recentProjects: [],
    hasProject: true,
    isDirty: false,
    selectedTrackCount: 0,
    ...overrides,
  };
}

function recent(index: number): RecentProject {
  return { name: `Project ${index}`, path: `/tmp/project-${index}.chdg`, lastOpenedAt: `2026-05-2${index}T00:00:00.000Z` };
}

describe("home dashboard next action", () => {
  it("uses New Project when no project is active", () => {
    expect(deriveHomeNextAction(input({ projectName: "Untitled", hasProject: false })).id).toBe("new_project");
  });

  it("uses Continue Setup when required paths are missing", () => {
    expect(deriveHomeNextAction(input({ missingPathWarnings: [{ kind: "sourcePath", message: "Missing source" }], audioPath: "demo.ogg", outputDir: "/tmp/out" })).id).toBe("continue_setup");
  });

  it("uses Source Review for a safe not-generated setup", () => {
    expect(deriveHomeNextAction(input({ sourcePath: "demo.mid", audioPath: "demo.ogg", outputDir: "/tmp/out" })).id).toBe("source_review");
  });

  it("selects Generate, Preview, and Review Generate from output status", () => {
    const ready = { sourcePath: "demo.mid", audioPath: "demo.ogg", outputDir: "/tmp/out" };
    expect(deriveHomeNextAction(input({ ...ready, outputStatus: "needs-regenerate" })).id).toBe("generate");
    expect(deriveHomeNextAction(input({ ...ready, outputStatus: "generated" })).id).toBe("preview");
    expect(deriveHomeNextAction(input({ ...ready, outputStatus: "failed" })).id).toBe("review_generate");
  });
});

describe("home dashboard helpers", () => {
  it("keeps the canonical workflow steps in order", () => {
    expect(deriveWorkflowStepStatuses(input()).map((step) => step.label)).toEqual(["Import source", "Source Review", "Generate", "Preview"]);
  });

  it("limits compact recent projects to three", () => {
    expect(limitRecentProjects([recent(1), recent(2), recent(3), recent(4)])).toEqual([recent(1), recent(2), recent(3)]);
  });

  it("marks only the active recent project with its output status", () => {
    const model = deriveHomeDashboardModel(input({ projectFilePath: "/tmp/project-1.chdg", outputStatus: "generated", recentProjects: [recent(1), recent(2)], sourcePath: "demo.mid", audioPath: "demo.ogg", outputDir: "/tmp/out" }));
    expect(model.recentProjects[0]).toMatchObject({ statusLabel: "Generated", statusTone: "success" });
    expect(model.recentProjects[1]).toMatchObject({ statusLabel: "Recent", statusTone: "neutral" });
  });

  it("keeps output labels stable", () => {
    expect(formatHomeOutputStatus("not-generated").label).toBe("Not generated");
    expect(formatHomeOutputStatus("needs-regenerate").label).toBe("Needs regenerate");
    expect(formatHomeOutputStatus("generated").label).toBe("Generated");
    expect(formatHomeOutputStatus("failed").label).toBe("Failed");
  });
});
