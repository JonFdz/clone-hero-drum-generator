# Angular Frontend Architecture Specification

## ADDED Requirements

### Requirement: Feature-oriented application structure

The Angular renderer SHALL organize application code primarily by feature ownership.

`core` SHALL contain only application-wide infrastructure.

`shared` SHALL contain only genuinely reusable UI primitives and utilities.

Feature-specific pages, components, services, models, and tests SHALL live in the feature that owns them.

#### Scenario: Feature code is added

- **WHEN** a new feature-specific component, model, service, or test is added
- **THEN** it is placed within its owning feature
- **AND** it is not added to a generic application-wide `components`, `services`, `data-access`, `helpers`, or `utils` directory

### Requirement: Component file separation

Every Angular component SHALL use external template and stylesheet files.

#### Scenario: A component is inspected

- **WHEN** `check:architecture` inspects an Angular component
- **THEN** the component declares `templateUrl` and `styleUrl` or an equivalent external stylesheet reference
- **AND** it does not declare inline `template` or inline `styles`

### Requirement: Explicit OnPush change detection

Every migrated Angular component SHALL use `ChangeDetectionStrategy.OnPush`.

#### Scenario: A migrated component is inspected

- **WHEN** `check:architecture` inspects a component
- **THEN** it finds `ChangeDetectionStrategy.OnPush`
- **OR** it finds an explicit documented exception listed in the architecture follow-up register

### Requirement: Feature dependency boundaries

A feature SHALL NOT import another feature's internal components, pages, services, or private models.

#### Scenario: A feature needs shared active-project state

- **WHEN** a feature needs active-project state or operations
- **THEN** it imports only the public contract exposed by `features/project-session`
- **AND** it does not reach into unrelated feature internals

### Requirement: Declarative templates

Angular templates SHALL NOT call methods that perform non-trivial collection or presentation derivation.

#### Scenario: A template renders filtered validation items

- **WHEN** a component renders a filtered or ordered collection
- **THEN** the collection is provided by a signal `computed`, a service, or a pure tested transformation
- **AND** the template does not invoke a method that filters, sorts, maps, or constructs the collection during render
