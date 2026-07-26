// Public API of the project-session feature.
//
// Other features and the application shell may import ONLY from this file to
// consume project-session capabilities. Direct imports into
// `features/project-session/*` internals are rejected by `check:architecture`.
//
// The transitional `ProjectWorkflowHydrator` is part of the public surface
// because it is the canonical open/create -> generation-workflow hydration
// path used by the shell and pages until #76 moves generation into a feature.
export { ProjectSessionStore } from "./project-session.store";
export {
	PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE,
	ProjectPersistenceService,
} from "./project-persistence.service";
export {
	ProjectWorkflowHydrator,
	toGenerateWorkflowState,
} from "./project-workflow-hydrator";
export type { ProjectWorkflowStateInput } from "./project-workflow-hydrator";
export type {
	ProjectSessionState,
	MissingPathWarning,
	CreateProjectOutcome,
	OpenProjectOutcome,
	OpenFromPickerOutcome,
	SaveProjectOutcome,
	SaveAsOutcome,
	ProjectPersistenceError,
	initialProjectSessionState,
} from "./project-session.model";
