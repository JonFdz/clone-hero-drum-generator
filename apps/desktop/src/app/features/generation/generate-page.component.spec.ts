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
						buildProjectStatePayload: vi.fn(),
					},
				},
				{
					provide: DesktopProjectStateService,
					useValue: {
						state: signal({
							outputStatus: "not-generated",
							projectFilePath: undefined,
							projectName: "Test",
						}),
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

	it("starts with overwrite dialog closed", () => {
		expect(component.showOverwriteDialog()).toBe(false);
	});

	it("computes status label as ready when no errors and can generate", () => {
		// With empty summary (canGenerate: false, errorCount: 0), should be "Ready to generate"
		expect(component.statusLabel()).toBe("Ready to generate");
	});

	it("computes status tone as success when idle with no errors", () => {
		expect(component.statusTone()).toBe("success");
	});

	it("cannot start generation when summary cannot generate", () => {
		expect(component.canStartGeneration()).toBe(false);
	});

	it("cannot open preview when no generation result", () => {
		expect(component.canOpenPreview()).toBe(false);
	});

	it("openPreview navigates to /preview when canOpenPreview is true", async () => {
		workflowState.set({
			...workflowState(),
			generationResult: { outputDir: "/tmp" },
		});
		await component.openPreview();
		expect(navigateByUrl).toHaveBeenCalledWith("/preview");
	});

	it("openPreview does not navigate when canOpenPreview is false", async () => {
		await component.openPreview();
		expect(navigateByUrl).not.toHaveBeenCalled();
	});

	it("generate calls generationService.generate and closes dialog on success", async () => {
		generateFn.mockResolvedValue({ ok: true, result: {} });
		await component.generate();
		expect(generateFn).toHaveBeenCalledWith(false);
		expect(component.showOverwriteDialog()).toBe(false);
	});

	it("generate opens overwrite dialog when needsOverwriteConfirmation", async () => {
		generateFn.mockResolvedValue({
			ok: false,
			needsOverwriteConfirmation: true,
			message: "Files exist",
		});
		await component.generate();
		expect(component.showOverwriteDialog()).toBe(true);
	});

	it("confirmOverwrite calls generate with overwrite=true and closes dialog", async () => {
		generateFn.mockResolvedValue({ ok: true, result: {} });
		component.showOverwriteDialog.set(true);
		await component.confirmOverwrite();
		expect(generateFn).toHaveBeenCalledWith(true);
		expect(component.showOverwriteDialog()).toBe(false);
	});

	it("cancelOverwrite closes the dialog without generating", () => {
		component.showOverwriteDialog.set(true);
		component.cancelOverwrite();
		expect(component.showOverwriteDialog()).toBe(false);
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
						buildProjectStatePayload: vi.fn(),
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
