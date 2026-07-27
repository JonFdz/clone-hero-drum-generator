import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";
import { GeneratePageComponent } from "./generate-page.component";
import { GenerationService } from "./generation.service";

const emptySummary = {
	canGenerate: false,
	errorCount: 0,
	warningCount: 0,
	infoCount: 0,
	items: [],
	checkedAt: new Date().toISOString(),
} as never;

describe("GeneratePageComponent", () => {
	const navigateByUrl = vi.fn();
	const generateFn = vi.fn();
	const openOutputFolder = vi.fn();
	const projectState = signal({
		outputStatus: "not-generated" as string,
		projectFilePath: undefined as string | undefined,
		projectName: "Test",
		missingPaths: [] as Array<{ kind: string; message: string }>,
	});

	const workflowState = signal({
		status: "idle" as string,
		generationResult: undefined as unknown,
		lastGeneratedAt: undefined as string | undefined,
		errorMessage: undefined as string | undefined,
		logs: [] as string[],
		sourcePath: undefined as string | undefined,
		audioPath: undefined as string | undefined,
		outputDir: undefined as string | undefined,
		selectedTracks: [] as number[],
		metadata: {} as Record<string, unknown>,
		offsetMs: 0 as number | undefined,
		outputFiles: undefined as
			| { chart?: string; songOgg?: string }
			| undefined,
	});

	let component: GeneratePageComponent;

	beforeEach(() => {
		vi.clearAllMocks();
		workflowState.set({
			status: "idle",
			generationResult: undefined,
			lastGeneratedAt: undefined,
			errorMessage: undefined,
			logs: [],
			sourcePath: undefined,
			audioPath: undefined,
			outputDir: undefined,
			selectedTracks: [],
			metadata: {},
			offsetMs: 0,
			outputFiles: undefined,
		});
		projectState.set({
			outputStatus: "not-generated",
			projectFilePath: undefined,
			projectName: "Test",
			missingPaths: [],
		});

		const injector = Injector.create({
			providers: [
				{ provide: Router, useValue: { navigateByUrl } },
				{
					provide: DesktopGenerateStateService,
					useValue: {
						state: workflowState,
						applyError: vi.fn(),
						applyGeneration: vi.fn(),
						startGenerating: vi.fn(),
						buildGenerateInput: vi.fn(),
					},
				},
				{
					provide: DesktopProjectStateService,
					useValue: {
						state: projectState,
						saveProject: vi.fn(),
					},
				},
				{
					provide: DesktopValidationService,
					useValue: {
						validateNow: vi.fn().mockReturnValue(emptySummary),
					},
				},
				{
					provide: GenerationService,
					useValue: {
						autosaveWarning: signal(null),
						generate: generateFn,
						openOutputFolder,
					},
				},
			],
		});

		component = runInInjectionContext(
			injector,
			() => new GeneratePageComponent(),
		);
	});

	it("reports managed generation as unavailable", () => {
		expect(component.statusLabel()).toBe("Generation unavailable");
		expect(component.reportMessage()).toContain(
			"Managed package generation is unavailable",
		);
		expect(component.generateActionLabel()).toBe("Generation Unavailable");
	});

	it("uses warning tone for the dormant generation route", () => {
		expect(component.statusTone()).toBe("warning");
	});

	it("cannot start generation when summary cannot generate", () => {
		expect(component.canStartGeneration()).toBe(false);
	});

	it("cannot open Preview without current canonical managed output", () => {
		expect(component.canOpenPreview()).toBe(false);
	});

	it("opens Preview for a current canonical project with both managed files", async () => {
		workflowState.set({
			...workflowState(),
			outputFiles: {
				chart: "/tmp/notes.chart",
				songOgg: "/tmp/song.ogg",
			},
		});
		projectState.update((state) => ({
			...state,
			outputStatus: "generated",
		}));
		await component.openPreview();
		expect(navigateByUrl).toHaveBeenCalledWith("/preview");
	});

	it.each([
		{ chart: "/tmp/notes.chart" },
		{ songOgg: "/tmp/song.ogg" },
	])("does not open Preview with an incomplete managed manifest", async (outputFiles) => {
		workflowState.set({
			...workflowState(),
			outputFiles,
		});
		projectState.update((state) => ({
			...state,
			outputStatus: "generated",
		}));

		await component.openPreview();

		expect(navigateByUrl).not.toHaveBeenCalled();
	});

	it("openPreview does not navigate when canOpenPreview is false", async () => {
		await component.openPreview();
		expect(navigateByUrl).not.toHaveBeenCalled();
	});

	it("generate delegates only to the unavailable service boundary", async () => {
		generateFn.mockResolvedValue({
			ok: false,
			error: "Managed package generation is not available.",
		});
		await component.generate();
		expect(generateFn).toHaveBeenCalledWith(false);
	});

	it("generate applies error when outcome has error", async () => {
		const applyError = vi.fn();
		// Rebuild with spy on applyError
		const injector = Injector.create({
			providers: [
				{ provide: Router, useValue: { navigateByUrl } },
				{
					provide: DesktopGenerateStateService,
					useValue: {
						state: workflowState,
						applyError,
						applyGeneration: vi.fn(),
						startGenerating: vi.fn(),
						buildGenerateInput: vi.fn(),
					},
				},
				{
					provide: DesktopProjectStateService,
					useValue: { state: signal({}), saveProject: vi.fn() },
				},
				{
					provide: DesktopValidationService,
					useValue: { validateNow: vi.fn().mockReturnValue(emptySummary) },
				},
				{
					provide: GenerationService,
					useValue: {
						autosaveWarning: signal(null),
						generate: vi
							.fn()
							.mockResolvedValue({ ok: false, error: "Something went wrong" }),
						openOutputFolder: vi.fn(),
					},
				},
			],
		});
		const c = runInInjectionContext(
			injector,
			() => new GeneratePageComponent(),
		);
		await c.generate();
		expect(applyError).toHaveBeenCalledWith("Something went wrong");
	});

	it("outputFileRows returns chart, ini, and optionally ogg", () => {
		const result = {
			files: {
				chart: "/tmp/notes.chart",
				songIni: "/tmp/song.ini",
				songOgg: "/tmp/song.ogg",
			},
		} as never;
		const rows = component.outputFileRows(result);
		expect(rows).toHaveLength(3);
		expect(rows[0].name).toBe("notes.chart");
		expect(rows[2].name).toBe("song.ogg");
	});

	it("outputFileRows omits song.ogg when not present", () => {
		const result = {
			files: {
				chart: "/tmp/notes.chart",
				songIni: "/tmp/song.ini",
				songOgg: undefined,
			},
		} as never;
		const rows = component.outputFileRows(result);
		expect(rows).toHaveLength(2);
	});

	it("statusGlyph returns correct symbols for each status", () => {
		expect(component.statusGlyph("ok")).toBe("✓");
		expect(component.statusGlyph("warning")).toBe("⚠");
		expect(component.statusGlyph("missing")).toBe("×");
	});
});
