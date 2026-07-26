# Quality Gates and Documentation Specification

## ADDED Requirements

### Requirement: Meaningful Angular quality commands

The desktop package SHALL provide meaningful commands for linting, architecture checks, tests, type checking, and production build.

#### Scenario: An implementation PR is prepared

- **WHEN** the agent prepares a PR
- **THEN** it runs:
  - `pnpm --filter @chdg/desktop lint`
  - `pnpm --filter @chdg/desktop check:architecture`
  - `pnpm --filter @chdg/desktop test`
  - `pnpm --filter @chdg/desktop typecheck`
  - `pnpm --filter @chdg/desktop build`
- **AND** it reports the result of each command in the PR body

### Requirement: Architecture enforcement

`check:architecture` SHALL fail for forbidden inline component metadata, browser-native prompts/confirms, invalid component change detection configuration, forbidden component bridge imports, and prohibited cross-feature imports.

#### Scenario: A prohibited inline template is introduced

- **WHEN** a component declares inline `template`
- **THEN** `check:architecture` fails
- **AND** identifies the offending file

### Requirement: Architecture documentation

The repository SHALL document the accepted Angular architecture and deferred follow-up candidates.

#### Scenario: A cleanup candidate is uncertain

- **WHEN** an agent suspects code or a route is obsolete but cannot prove it is safe to delete
- **THEN** the candidate is recorded in `docs/architecture/angular-refactor-follow-ups.md`
- **AND** the candidate is not deleted
