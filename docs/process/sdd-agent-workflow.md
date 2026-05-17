# CHDG SDD Agent Workflow

## Purpose

This document defines how CHDG work should be performed with Gentle-AI / Pi SDD.

## Roles

```txt
Jon + ChatGPT:
  - product direction
  - proposal
  - spec
  - design
  - verify plan
  - GitHub issue creation
  - external PR review
  - merge approval

Pi / gentle-ai agent:
  - read OpenSpec artifacts
  - sync accepted context to Engram
  - implement/apply
  - run focused self-checks
  - commit and push
  - create or update PR
  - never merge
```

## Source of truth

Engram is the source of truth for project memory.

OpenSpec artifacts are file-backed transfer/review artifacts. They exist so Jon can review the plan and the agent can import precise local work instructions.

Before implementation, the agent must:

1. Read the OpenSpec change artifacts.
2. Transfer accepted context, decisions, non-goals, tasks and validation rules to Engram.
3. Work from Engram as persistent project memory.
4. Keep OpenSpec artifacts and docs updated only when requested by the phase.

## Standard phase flow

```txt
1. ChatGPT prepares OpenSpec ZIP.
2. Jon reviews and requests changes if needed.
3. ChatGPT creates GitHub issue after approval.
4. ChatGPT provides implementation prompt .md.
5. Pi/gentle-ai agent implements on the requested branch.
6. Agent commits, pushes and creates/updates PR.
7. ChatGPT reviews PR.
8. Jon explicitly approves merge.
```

## GitHub issue and PR policy

Each phase/feature should have a GitHub issue.

PRs should link to the issue, usually with:

```md
Closes #<issue-number>
```

The agent may create the PR, but must not merge it.

## Branch naming

Preferred branch format:

```txt
feat/phase-04b-track-detection-hardening
feat/phase-04a-audio-packaging
feat/phase-05-pro-drums-flags
```

## Validation policy

For most code changes, run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

If a local demo validation is requested, use Jon's absolute local paths when provided. Do not substitute relative paths if the OpenSpec artifact gives absolute paths.

Example:

```bash
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid --track 53 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
```

## Review policy

The implementation agent should perform focused self-checks only.

The general review is external and belongs to Jon/ChatGPT.

Do not mark manual Moonscraper/Clone Hero validation complete unless it was actually performed.
