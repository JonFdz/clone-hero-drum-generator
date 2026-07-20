# Current Desktop UX Audit

**Status:** CURRENT baseline complete; awaiting Approval Checkpoint 1  
**Issue:** #89  
**Evidence:** deterministic browser screenshots plus read-only code inspection  
**Last updated:** 2026-07-18

## Audit scope

This audit covers the eight required browser-harness states at 1440 × 900 and 1024 × 768. It does not select an information architecture or authorize production behavior changes.

Evidence labels:

- **Screenshot-confirmed:** visible in the baseline catalog.
- **Behavior-confirmed:** reproduced through direct route loading and reload.
- **Code-confirmed:** supported by read-only application code.
- **Unresolved:** current evidence is insufficient for a product assumption.

## Priority summary

| Priority | Finding | Severity | Category |
|---:|---|---|---|
| 1 | Attention is hidden while Source Review reports “up to date” | High | Interaction behavior |
| 2 | Workflow stages are presented as global destinations | High | Information architecture |
| 3 | 1024 layouts spend too much space on shell and sticky actions | High | Visual |
| 4 | Generation failure presents contradictory status and recovery cues | High | Interaction behavior |
| 5 | Source Review becomes an exceptionally long multi-purpose page | High | Information architecture |
| 6 | Persistence semantics are split across manual save and conditional autosave | Medium | Domain/product behavior |
| 7 | Home empty state offers too many equal entry points | Medium | Information architecture |
| 8 | Running generation lacks meaningful phase progression | Medium | Interaction behavior |
| 9 | Preview-ready does not exercise the primary visual-preview experience | Medium | Unresolved |
| 10 | Focus treatment is not explicitly defined | Low | Visual |

## UX-001 — Source Review attention is hidden behind an “up to date” status

**Severity:** High  
**Category:** Interaction behavior  
**Affected screens:** Source Review / Attention at both viewports

### Problem

The attention scenario displays `Source review up to date` in the page header while an expanded Mapping Review lower on the page says `Manual mapping needed`, reports one unknown source, and recommends review. The primary Continue action remains enabled.

### Evidence

- Screenshot-confirmed: `current-ui/1440x900/source-review-attention.png` and `current-ui/1024x768/source-review-attention.png` look ready in the first viewport.
- Behavior-confirmed: the attention page exposes `Manual mapping needed`, `1 unknown`, and `UNKNOWN_MIDI_NOTE` farther down the page.
- Code-confirmed: `canContinue` requires source, selected tracks, normalization preview, and no error; it does not block on warnings or unknown mappings.
- Code-confirmed: warning issues are “Review recommended”; only error-severity issues force the Issues section open.

### User consequence

Users may continue without understanding what was skipped, or may assume “up to date” means no review is required. The distinction between advisory attention and blocking work is not clear at the decision point.

### Design V1 response

Surface attention near the page identity and next action, state explicitly whether it blocks progression, and provide a direct path to the affected mapping row without redefining current warning behavior.

### Open question

Should unresolved unknown mappings remain advisory in Design V1, or should any subset become blocking through a separate product decision?

## UX-002 — Global navigation conflates product destinations and workflow stages

**Severity:** High  
**Category:** Information architecture  
**Affected screens:** All required screens

### Problem

Home, Projects, Source Review, Generate, Preview, and Settings appear as peer-level global destinations even though Source Review, Generate, and Preview form an ordered project workflow.

### Evidence

- Screenshot-confirmed: the same six-item sidebar appears across every baseline.
- Code-confirmed: the application route table exposes each workflow stage directly and contains no route guard or visible workflow-state model.
- Repeated pattern: page-level Back/Continue actions attempt to restore sequence that global navigation does not communicate.

### User consequence

Users must infer order, prerequisites, completed stages, and safe revisitation. A destination can look available even when the active project is not ready for it.

### Design V1 response

Separate stable global destinations from project workflow navigation, while preserving direct access and revisitation.

### Open question

When revisiting a completed stage after generation, which edits are safe and which should explicitly mark output as needing regeneration?

## UX-003 — The 1024 desktop window is dominated by shell and sticky controls

**Severity:** High  
**Category:** Visual  
**Affected screens:** All 1024 × 768 baselines, especially Generate and Source Review

### Problem

The fixed 260 px sidebar consumes roughly one quarter of the window. Loaded-project top bars wrap from 68 px to 109–124 px. Generate’s sticky action bar becomes 138 px high, leaving a small working viewport over long stacked content.

### Evidence

- Screenshot-confirmed: all files under `current-ui/1024x768/`.
- Measured behavior: content width is 764 px; loaded-project content height falls to 644–659 px.
- Measured behavior: Source Review scroll heights are 1917 px ready and 2493 px attention.
- Measured behavior: Generate scroll heights range from 1828 px to 2156 px while the action bar occupies 138 px.
- Positive constraint: no page-level horizontal overflow was observed.

### User consequence

Orientation chrome and persistent controls crowd out the task itself. Attention and recovery details move far below the fold, and fixed actions obscure nearby content.

### Design V1 response

Preserve desktop navigation but reduce shell competition, prioritize project/workflow context, and design an intentional compact action pattern for 1024 without introducing mobile navigation.

### Open question

Which top-bar actions must remain permanently visible at ordinary desktop-window sizes?

## UX-004 — Generation failure presents contradictory status and recovery cues

**Severity:** High  
**Category:** Interaction behavior  
**Affected screens:** Generate / Failed at both viewports

### Problem

The page says `Failed` and `Generation failed. Review the log`, while the Validation Report says warnings are present but generation is allowed. Every generation step is labeled Failed, and the recovery action is still called `Start Generate` rather than Retry.

### Evidence

- Screenshot-confirmed: `current-ui/1440x900/generate-failed.png` and `current-ui/1024x768/generate-failed.png`.
- Behavior-confirmed: Start Generate is enabled; Open Preview is disabled.
- Code-confirmed: a previous-generation failure is represented as a non-blocking warning when current prerequisites remain valid.
- Code-confirmed: one page-level state is applied to every generation step, so all steps share Failed/Running/Completed rather than identifying the actual phase.

### User consequence

Users cannot quickly distinguish current readiness from the previous attempt’s outcome, identify the failed phase, or know whether immediate retry is appropriate.

### Design V1 response

Separate current readiness from last-run outcome, identify the failed phase when available, promote the recovery action, and keep technical evidence secondary but accessible.

### Open question

Does retry always repeat the complete pipeline, and which failures require the user to return to Source Review first?

## UX-005 — Source Review combines too many mental models in one long surface

**Severity:** High  
**Category:** Information architecture  
**Affected screens:** Source Review / Ready and Attention

### Problem

Source identity, source facts, combined facts, piece summary, track selection, mapping review, profile CRUD, issues, advanced JSON, and workflow navigation occupy one continuous page.

### Evidence

- Screenshot-confirmed: the first viewport shows only the upper subset of Source Review.
- Measured behavior: the attention state reaches 1643 px at 1440 and 2493 px at 1024.
- Code-confirmed: the page owns dialogs and controls for profile creation, editing, deletion, mapping filters, issue review, and advanced JSON.
- Repeated pattern: three adjacent summary cards repeat source/selection/mapping information later used by detailed sections.

### User consequence

The user must scan a large surface to discover the one item that needs action, while exceptional profile and diagnostic capabilities compete with the core review task.

### Design V1 response

Define one dominant review region, move exceptional actions behind contextual disclosure, keep attention local to the affected content, and preserve full capability.

### Open question

How frequently are mapping profiles created or edited during a normal project?

## UX-006 — Persistence semantics are split across manual save and conditional autosave

**Severity:** Medium  
**Category:** Domain/product behavior  
**Affected screens:** Project Details, Source Review, Generate, global shell

### Problem

The shell exposes Save and Save As globally, Project Details repeats Save Changes and Save As, and the application conditionally autosaves analysis and successful generation results only when a project file path exists.

### Evidence

- Screenshot-confirmed: project save actions repeat in the top bar and Project Details summary.
- Code-confirmed: ordinary state setters mark the active project dirty.
- Code-confirmed: Source Review autosaves a refreshed analysis cache when the project already has a file path.
- Code-confirmed: successful generation autosaves its result when the project already has a file path; failures surface a warning and require manual Save.

### User consequence

Users cannot easily predict what has persisted, what only lives in memory, or whether navigating away is safe.

### Design V1 response

Expose one coherent persistence status and distinguish saved project data, unsaved edits, generated output, and autosave failure without duplicating controls everywhere.

### Open question

Should Design V1 merely clarify current persistence, or is a broader autosave policy change desired as separate product work?

## UX-007 — Home empty state offers too many equal entry points

**Severity:** Medium  
**Category:** Information architecture  
**Affected screens:** Home / Empty

### Problem

New Project, Open Project, Import MIDI, Import Guitar Pro, Open Output Folder, View all projects, and Learn more are all immediately available alongside workflow and healthy-system summaries.

### Evidence

- Screenshot-confirmed: `current-ui/1440x900/home-empty.png` and `current-ui/1024x768/home-empty.png`.
- Measured behavior: the empty Home page scroll height grows from 913 px to 1789 px at 1024.
- Repeated pattern: healthy runtime and project-format information receive a full panel despite requiring no action.

### User consequence

The first-time or returning user lacks a dominant start action and must understand multiple entry paths before having an active project.

### Design V1 response

Prioritize create/open project, contextualize source import within project creation, and demote healthy system information.

### Open question

Are direct MIDI/GP imports expected to create a project automatically, or are they shortcuts into Project Details?

## UX-008 — Running generation shows activity but not meaningful progress

**Severity:** Medium  
**Category:** Interaction behavior  
**Affected screens:** Generate / Running

### Problem

The header says Generating, but the Validation Report still says Ready to generate and every pipeline step is labeled Running. Open Output Folder remains enabled while Start Generate and Preview are disabled.

### Evidence

- Screenshot-confirmed: `current-ui/1440x900/generate-running.png` and `current-ui/1024x768/generate-running.png`.
- Code-confirmed: one running state is applied to all seven steps.
- Code-confirmed: Open Output Folder is enabled whenever an output directory exists, independent of generation status.

### User consequence

The user sees activity without knowing the current phase, completed work, remaining work, or which side actions are safe.

### Design V1 response

Show current phase and completed/pending steps when the runtime can provide them; otherwise present honest indeterminate progress and explicitly constrain unsafe actions.

### Open question

Is opening the output folder during generation intentionally safe, merely tolerated, or accidental UI availability?

## UX-009 — Preview-ready does not represent the primary visual-preview experience

**Severity:** Medium  
**Category:** Unresolved  
**Affected screens:** Preview / Ready at both viewports

### Problem

The required preview-ready scenario contains generated chart timing data but no preview audio. The screen therefore shows No preview audio and Timing Diagnostics; the transport, waveform, chart stage, Highway, and offset panel are absent.

### Evidence

- Screenshot-confirmed: both `preview-ready.png` captures.
- Behavior-confirmed: status is `Chart ready · audio unavailable`.
- Code-confirmed: audio-backed preview and chart/Highway controls render only when an audio source is available.
- Harness-confirmed: `preview-ready` seeds generated output and chart data without disk-backed audio.

### User consequence

The baseline validates the fallback state but provides no deterministic visual evidence for the product’s primary preview workflow.

### Design V1 response

Keep the fallback honest and record the visual-preview experience as unverified until maintainers approve an evidence source or a separate harness follow-up.

### Open question

May later Design V1 work use existing approved Highway design artifacts as proposed-state reference, or is a new deterministic audio-backed harness scenario required first?

## UX-010 — Keyboard focus treatment is not explicitly defined

**Severity:** Low  
**Category:** Visual  
**Affected screens:** All interactive screens

### Problem

Buttons, links, fields, selects, filter controls, and custom preview controls have hover/active styling, but the inspected global and shell styles do not define an explicit shared `:focus-visible` treatment.

### Evidence

- Code-confirmed: baseline styles define normal, hover, active, and disabled states but no shared focus token or rule.
- Screenshot limitation: static screenshots cannot verify keyboard traversal or native focus behavior.

### User consequence

Keyboard users may receive inconsistent browser-default focus feedback across custom dark controls.

### Design V1 response

Define a visible, high-contrast focus state in Foundations V1 and require it for every interactive component.

### Open question

None for the design baseline; implementation verification remains follow-up work.

## Cross-screen observations

- **Orientation:** active route is visible, but workflow position and completed/attention states are not.
- **Active project context:** project name is present outside Home, but file, output, runtime, and version status compete for the same top-bar space.
- **Revisitation:** routes and Back links exist; safe revisitation after edits remains behaviorally unresolved.
- **Action priority:** Project Details and Generate expose repeated or competing actions; Source Review’s primary action is far below the first viewport.
- **Progressive disclosure:** JSON, logs, mapping profile metadata, healthy runtime status, and timing diagnostics are strong candidates.
- **Status semantics:** errors block generation; warnings are currently non-blocking. Source Review unknown mappings are advisory in current code.
- **Accessibility:** text accompanies most symbolic icons and statuses; 44 px default controls are generally adequate. Explicit focus treatment is missing.
- **Consistency:** `Cover / Portada` mixes languages in an otherwise English-first interface; this is localized polish rather than a top-priority workflow blocker.

## Product-behavior ambiguities carried into Checkpoint 1

1. Whether unknown mappings should remain advisory.
2. Whether opening the output folder during generation is intentionally safe.
3. Exact retry scope and which failures require returning to Source Review.
4. Whether current conditional autosave should only be clarified or redesigned.
5. Safe revisitation rules after generated output exists.
6. Whether preview Design V1 requires a new deterministic audio-backed scenario.

## Initial criteria for later IA alternatives

The two alternatives should be judged against:

1. immediate project and workflow orientation;
2. visible advisory versus blocking attention;
3. one dominant next action;
4. safe and understandable revisitation;
5. coherent persistence and output status;
6. strong recovery from failed generation;
7. progressive disclosure of profiles, JSON, logs, diagnostics, and healthy runtime data;
8. viable 1024 × 768 density without mobile navigation;
9. preservation of all current capabilities;
10. honest separation of visual, interaction, and domain behavior changes.

