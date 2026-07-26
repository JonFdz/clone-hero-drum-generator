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
  it("uses Open Project when creation is unavailable and no project is active", () => {
    expect(deriveHomeNextAction(input({ projectName: "Untitled", hasProject: false }))).toMatchObject({
      id: "open_project",
      label: "Open Project",
      route: "/projects",
    });
  });

  it("offers only Open Project when referenced paths are missing", () => {
    expect(deriveHomeNextAction(input({ missingPathWarnings: [{ kind: "sourcePath", message: "Missing source" }], audioPath: "demo.ogg", outputDir: "/tmp/out" }))).toMatchObject({
      id: "open_project",
      route: "/projects",
    });
  });

  it("offers Mappings for an opened project with a source", () => {
    expect(deriveHomeNextAction(input({ sourcePath: "demo.mid", audioPath: "demo.ogg", outputDir: "/tmp/out" }))).toMatchObject({
      id: "mappings",
      route: "/mapping",
    });
  });

  it("does not require an optional export target or cover to inspect mappings", () => {
    const action = deriveHomeNextAction(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputDir: undefined,
      missingPathWarnings: [
        { kind: "outputDir", message: "No export target" },
        { kind: "coverImagePath", message: "No optional cover" },
      ],
    }));

    expect(action).toMatchObject({ id: "mappings", route: "/mapping" });
  });

  it("does not advertise Preview when current export output is unavailable", () => {
    const withoutTarget = deriveHomeNextAction(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputStatus: "generated",
    }));
    const missingRecordedTarget = deriveHomeNextAction(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputDir: "/missing/export",
      outputStatus: "generated",
      missingPathWarnings: [
        { kind: "outputDir", path: "/missing/export", message: "Missing outputDir" },
      ],
    }));

    for (const action of [withoutTarget, missingRecordedTarget]) {
      expect(action).toMatchObject({ id: "open_project", route: "/projects" });
      expect(action.description).toContain("persisted export status is current");
      expect(action.route).not.toBe("/preview");
    }
  });

  it("blocks Preview when the target exists but required managed files are missing", () => {
    const dashboard = deriveHomeDashboardModel(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputDir: "/existing/export",
      outputStatus: "generated",
      missingPathWarnings: [
        {
          kind: "outputChartPath",
          path: "/existing/export/notes.chart",
          message: "Missing managed chart",
        },
        {
          kind: "outputAudioPath",
          path: "/existing/export/song.ogg",
          message: "Missing managed audio",
        },
      ],
    }));

    expect(dashboard.nextAction).toMatchObject({
      id: "open_project",
      route: "/projects",
    });
    expect(dashboard.outputStatus.label).toBe("Generated output unavailable");
    expect(
      dashboard.workflow.find((step) => step.label === "Preview")?.status,
    ).toBe("blocked");
  });

  it("blocks the Preview workflow step when current output is missing", () => {
    const workflow = deriveWorkflowStepStatuses(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputDir: "/missing/export",
      outputStatus: "generated",
      missingPathWarnings: [
        { kind: "outputDir", path: "/missing/export", message: "Missing outputDir" },
      ],
    }));

    expect(workflow.find((step) => step.label === "Export status")?.status).toBe("unknown");
    expect(workflow.find((step) => step.label === "Preview")?.status).toBe("blocked");
  });

  it("keeps Preview available for current output with an existing target", () => {
    const dashboard = deriveHomeDashboardModel(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputDir: "/existing/export",
      outputStatus: "generated",
    }));

    expect(dashboard.outputStatus.label).toBe("Generated");
    expect(dashboard.nextAction).toMatchObject({
      id: "preview",
      route: "/preview",
    });
    expect(
      dashboard.workflow.find((step) => step.label === "Preview")?.status,
    ).toBe("available");
  });

  it("never offers Generate or retry actions from export status", () => {
    const ready = { sourcePath: "demo.mid", audioPath: "demo.ogg", outputDir: "/tmp/out" };
    expect(deriveHomeNextAction(input({ ...ready, outputStatus: "needs-regenerate" })).id).toBe("mappings");
    expect(deriveHomeNextAction(input({ ...ready, outputStatus: "generated" })).id).toBe("preview");
    expect(deriveHomeNextAction(input({ ...ready, outputStatus: "failed" })).id).toBe("mappings");
  });

  it("never offers unavailable setup or generation routes", () => {
    const variants = [
      input({ hasProject: false }),
      input({ missingPathWarnings: [{ kind: "audioPath", message: "Missing" }] }),
      input({ sourcePath: "demo.mid", outputStatus: "not-generated" }),
      input({ sourcePath: "demo.mid", outputStatus: "needs-regenerate" }),
      input({ sourcePath: "demo.mid", outputStatus: "failed" }),
      input({ sourcePath: "demo.mid", outputStatus: "generated" }),
    ];
    for (const variant of variants) {
      const action = deriveHomeNextAction(variant);
      expect(action.route).not.toBe("/generate");
      expect(action.route).not.toBe("/projects/details");
      expect(action.secondaryRoute).not.toBe("/generate");
      expect(action.label).not.toMatch(/Setup|Generate|Retry/);
    }
  });
});

describe("home dashboard helpers", () => {
  it("keeps the canonical workflow steps in order", () => {
    expect(deriveWorkflowStepStatuses(input()).map((step) => step.label)).toEqual(["Project source", "Mappings", "Export status", "Preview"]);
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

  it("does not claim generated output is available when its target is missing", () => {
    const model = deriveHomeDashboardModel(input({
      sourcePath: "assets/source.mid",
      audioPath: "assets/song.ogg",
      outputDir: "/missing/export",
      outputStatus: "generated",
      missingPathWarnings: [
        { kind: "outputDir", path: "/missing/export", message: "Missing outputDir" },
      ],
    }));

    expect(model.outputStatus).toMatchObject({
      label: "Generated output unavailable",
      tone: "warning",
    });
    expect(model.outputStatus.detail).not.toContain("output is available");
  });
});
