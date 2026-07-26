# Design: Phase 16B — Mapping Override Profiles

## Overview

Phase 16B adds local reusable profiles for project mapping overrides.

Profiles are independent local templates. Applying a profile copies its overrides into the current project.

## Architecture

Recommended split:

```txt
packages/project
  mapping profile types
  profile validation
  apply profile helpers

apps/desktop/electron
  local profile persistence using existing settings/userData patterns
  narrow bridge methods for profiles

apps/desktop/src/app/services
  profile state/service
  integration with project mapping overrides

apps/desktop/src/app/pages/mapping
  profile list and apply UI
```

Use existing boundaries where possible.

## Data model

Recommended:

```ts
type MappingOverrideProfile = {
  id: string;
  name: string;
  description?: string;
  sourceKind?: "midi" | "gpif";
  overrides: ProjectMappingOverrides;
  createdAt: string;
  updatedAt: string;
};
```

## Profile collection

Recommended local file shape:

```ts
type MappingOverrideProfileStore = {
  schemaVersion: 1;
  profiles: MappingOverrideProfile[];
};
```

Malformed entries should be filtered or reported safely.

## Apply helper

Add pure helper:

```ts
applyMappingProfile(input: {
  projectOverrides: ProjectMappingOverrides;
  profileOverrides: ProjectMappingOverrides;
  mode: "replace" | "merge";
}): {
  overrides: ProjectMappingOverrides;
  summary: {
    added: number;
    replaced: number;
    kept: number;
    removed?: number;
  };
};
```

Exact names can follow repo style.

## Merge behavior

Required behavior:

```txt
replace -> return profile overrides
merge -> project overrides + profile overrides, profile wins on key conflicts
```

## UI

Add profile controls to Mapping page or a dedicated Mapping Profiles section.

Required UI:

```txt
profile list
empty state
profile name
description
source kind
override count
create from current project overrides
apply to current project
apply mode: replace/merge
conflict summary
update profile from current project overrides
delete profile
status/error messages
```

## Staleness

Applying a profile should call the same project override update path as manual mapping edits.

That means:

```txt
project dirty
normalization preview stale
generated output needs-regenerate when applicable
```

## Security

Do not add renderer `fs`.

Electron bridge should expose narrow operations:

```txt
readMappingProfiles
writeMappingProfiles / saveMappingProfile
deleteMappingProfile
```

or a similarly narrow API.

No generic file read/write bridge.

## Tests

Prefer pure helper tests:

```txt
profile validation
old/missing profile store loads empty
create profile from overrides
replace apply
merge apply
conflict summary
malformed profile ignored
applying profile marks stale through service/helper
```

Component tests can focus on model helpers if Angular UI tests are expensive.

## Scope guard

Do not implement:

```txt
built-in Songsterr profiles
cloud sync
community profiles
automatic profile detection
note editor
packaging
full UX polish
```
