import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { SourceReviewOrchestratorService } from "../../services/source-review-orchestrator.service";
import { MappingProfileService } from "./mapping-profile.service";
import { SourceReviewPageComponent } from "./source-review-page.component";

describe("SourceReviewPageComponent", () => {
	const navigateByUrl = vi.fn();
	const reviewCurrentSource = vi.fn();
	const toggleTrack = vi.fn();
	const mappingChanged = vi.fn();
	const loadProfiles = vi.fn();
	const saveProfile = vi.fn();

	const workflowState = signal({
		sourcePath: undefined as string | undefined,
		sourceKind: undefined as string | undefined,
		selectedTracks: [] as number[],
		mappingOverrides: {} as Record<string, unknown>,
		inspection: undefined as unknown,
		normalizationPreview: undefined as unknown,
		analysisCache: undefined as unknown,
		errorMessage: undefined as string | undefined,
		status: "idle" as string,
	});

	let component: SourceReviewPageComponent;

	beforeEach(() => {
		vi.clearAllMocks();
		workflowState.set({
			sourcePath: undefined,
			sourceKind: undefined,
			selectedTracks: [],
			mappingOverrides: {},
			inspection: undefined,
			normalizationPreview: undefined,
			analysisCache: undefined,
			errorMessage: undefined,
			status: "idle",
		});

		const injector = Injector.create({
			providers: [
				{ provide: Router, useValue: { navigateByUrl } },
				{
					provide: SourceReviewOrchestratorService,
					useValue: {
						status: signal("idle"),
						autosaveWarning: signal(undefined),
						reviewCurrentSource,
						toggleTrack,
						mappingChanged,
					},
				},
				{
					provide: MappingProfileService,
					useValue: {
						profiles: signal([]),
						loadProfiles,
						saveProfile,
					},
				},
				{
					provide: DesktopGenerateStateService,
					useValue: {
						state: workflowState,
						setAnalysisCache: vi.fn(),
						setMappingOverrides: vi.fn(),
						setMetadata: vi.fn(),
						buildNormalizeInput: vi.fn(),
						buildProjectStatePayload: vi.fn(),
					},
				},
			],
		});

		component = runInInjectionContext(
			injector,
			() => new SourceReviewPageComponent(),
		);
	});

	it("exposes pure formatting helpers for the template", () => {
		expect(component.pieceLabel("kick")).toBe("Kick");
		expect(component.pieceLabel("hihat_closed")).toBe("Closed Hi-Hat");
		expect(component.confidenceLabel("strong")).toBe("Strong");
		expect(component.confidenceLabel("unknown")).toBe("N/A");
		expect(component.filePath("/tmp/demo.mid")).toBe("demo.mid");
		expect(component.filePath(undefined)).toBe("");
	});

	it("starts with dialog closed and no user override state", () => {
		expect(component.showProfileDialog()).toBe(false);
		expect(component.mappingUserOpen()).toBe(false);
		expect(component.issuesUserOpen()).toBe(false);
		expect(component.jsonOpen()).toBe(false);
	});

	it("openProfileDialog opens and cancelProfileDialog closes the dialog", () => {
		component.openProfileDialog();
		expect(component.showProfileDialog()).toBe(true);
		component.cancelProfileDialog();
		expect(component.showProfileDialog()).toBe(false);
	});

	it("isMappingIssue detects mapping-related issues but not info severity", () => {
		expect(
			component.isMappingIssue({
				severity: "warning",
				code: "UNKNOWN_MIDI_NOTE",
				message: "Unknown MIDI note 42",
			}),
		).toBe(true);
		expect(
			component.isMappingIssue({
				severity: "info",
				code: "UNKNOWN_MIDI_NOTE",
				message: "Unknown MIDI note 42",
			}),
		).toBe(false);
		expect(
			component.isMappingIssue({
				severity: "warning",
				code: "TEMPO_GAP",
				message: "Large tempo gap",
			}),
		).toBe(false);
	});

	it("mappingSourceKind infers from key prefix when sourceKind is missing", () => {
		expect(
			component.mappingSourceKind({
				key: "gpif:side stick",
				sourceValue: "side stick",
			} as never),
		).toBe("gpif");
		expect(
			component.mappingSourceKind({
				key: "midi:36",
				sourceValue: "36",
			} as never),
		).toBe("midi");
	});

	it("canContinue is false when no source is selected", () => {
		expect(component.canContinue()).toBe(false);
	});

	it("canContinue is true when source, tracks, and preview are present", () => {
		workflowState.set({
			sourcePath: "/tmp/demo.mid",
			sourceKind: "midi",
			selectedTracks: [1],
			mappingOverrides: {},
			inspection: { tracks: [] },
			normalizationPreview: { hitCount: 100 },
			analysisCache: undefined,
			errorMessage: undefined,
			status: "idle",
		});
		expect(component.canContinue()).toBe(true);
	});

	it("continueToGenerate navigates to /generate when canContinue is true", async () => {
		workflowState.set({
			sourcePath: "/tmp/demo.mid",
			sourceKind: "midi",
			selectedTracks: [1],
			mappingOverrides: {},
			inspection: { tracks: [] },
			normalizationPreview: { hitCount: 100 },
			analysisCache: undefined,
			errorMessage: undefined,
			status: "idle",
		});
		await component.continueToGenerate();
		expect(navigateByUrl).toHaveBeenCalledWith("/generate");
	});

	it("continueToGenerate does not navigate when canContinue is false", async () => {
		await component.continueToGenerate();
		expect(navigateByUrl).not.toHaveBeenCalled();
	});

	it("confirmSaveProfile closes dialog and calls saveProfile with a valid profile", async () => {
		saveProfile.mockResolvedValue({ ok: true, profiles: [] });
		await component.confirmSaveProfile("My Profile");
		expect(component.showProfileDialog()).toBe(false);
		expect(saveProfile).toHaveBeenCalledTimes(1);
		const arg = saveProfile.mock.calls[0][0];
		expect(arg.name).toBe("My Profile");
		expect(arg.id).toBeTruthy();
	});

	it("confirmSaveProfile does not call saveProfile when name is empty", async () => {
		await component.confirmSaveProfile("");
		expect(saveProfile).not.toHaveBeenCalled();
	});

	it("ngOnInit loads profiles and reviews the source", async () => {
		reviewCurrentSource.mockResolvedValue(undefined);
		loadProfiles.mockResolvedValue({ ok: true, profiles: [] });
		await component.ngOnInit();
		expect(loadProfiles).toHaveBeenCalledTimes(1);
		expect(reviewCurrentSource).toHaveBeenCalledTimes(1);
	});
});
