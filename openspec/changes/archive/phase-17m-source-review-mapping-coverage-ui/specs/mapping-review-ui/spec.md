# Spec — Mapping Review UI

## ADDED Requirements

### Requirement: Mapping Review shall show category-aware coverage summary

Source Review Mapping Review SHALL show a summary that distinguishes mapped, candidate, ignored known, unknown, and override counts.

#### Scenario: Coverage summary with all categories

Given normalization preview has mapping coverage  
When Source Review renders Mapping Review  
Then the summary shows mapped events  
And candidate events  
And ignored known events  
And unknown events  
And override count.

### Requirement: Mapping Review shall provide mapping filters

Source Review Mapping Review SHALL provide filters:

- Needs review
- Candidates
- Unknown
- Ignored known
- Auto-mapped
- Overrides
- All

#### Scenario: Needs review filter

Given Mapping Review has unresolved candidates and unresolved unknowns  
When the user selects Needs review  
Then only unresolved candidate and unresolved unknown rows are shown.

#### Scenario: Ignored known excluded from Needs review

Given Mapping Review has only ignored known percussion  
When Needs review is selected  
Then ignored known rows are not shown.

### Requirement: Mapping Review shall choose sensible default filter

Mapping Review SHALL default to Needs review when unresolved candidates or unknowns exist.

Mapping Review SHALL default to All when there are no unresolved candidates or unknowns.

#### Scenario: Pending rows exist

Given at least one unresolved candidate exists  
When Source Review opens  
Then Mapping Review defaults to Needs review.

#### Scenario: No pending rows exist

Given all rows are mapped, ignored known, or resolved by override  
When Source Review opens  
Then Mapping Review defaults to All.

### Requirement: Candidate rows shall be actionable

Candidate rows SHALL show their suggested piece when present and SHALL provide actions to apply suggestion, ignore, or map to another piece.

#### Scenario: Candidate with suggestion

Given row `midi:44` is a candidate with suggested piece `hihat_closed`  
When Mapping Review renders the row  
Then it shows Candidate status  
And suggested Closed Hi-Hat  
And an Apply suggestion action.

#### Scenario: Apply suggestion

Given row `midi:44` has suggested piece `hihat_closed`  
When the user applies suggestion  
Then a project mapping override is created for `midi:44` to `hihat_closed`.

### Requirement: Unknown rows shall require manual decision

Unknown rows SHALL stand out and provide Map to and Ignore actions.

#### Scenario: Unknown row

Given row `midi:92` is unknown  
When Mapping Review renders  
Then it appears in Unknown  
And Needs review  
And has Map to and Ignore actions.

### Requirement: Ignored known rows shall be visible but low-priority

Ignored known rows SHALL be visible and SHALL NOT be treated as strong warnings or unresolved needs-review items.

#### Scenario: Ignored known row

Given row `midi:54` is ignored known percussion  
When Mapping Review renders  
Then it shows Ignored known status  
And does not appear as Unknown  
And does not appear in Needs review  
And allows Map to if the user wants to chart it.

### Requirement: Auto-mapped rows shall show default mapping

Auto-mapped rows SHALL show their default mapping and allow override or ignore.

#### Scenario: Auto-mapped row

Given row `midi:36` maps to Kick  
When Mapping Review renders  
Then it shows Auto-mapped status  
And default Kick mapping  
And override/ignore actions.

### Requirement: Override rows shall show reset action

Rows with project overrides SHALL display override state and SHALL provide Reset override.

#### Scenario: Reset override

Given row `midi:44` has a piece override  
When the user resets override  
Then the override is removed  
And Source Review recalculates mapping state.

### Requirement: Mapping Review shall preserve Phase 17L semantics

Mapping Review SHALL NOT change atlas decisions, candidate generation behavior, ignored known behavior, unknown behavior, or chart generation behavior.

#### Scenario: Candidate default behavior unchanged

Given row `midi:44` is a candidate  
When the user does not apply an override  
Then it remains skipped by default.

### Requirement: Mapping Review shall not introduce out-of-scope features

The implementation SHALL NOT add:

- candidate automap profile;
- GPIF articulation resolver;
- tempo review;
- Preview changes;
- Generate redesign;
- global mapping editor.

#### Scenario: No GPIF articulation resolver

Given GPIF InputMidiNumbers 92 exists  
When Phase 17M is implemented  
Then no new GPIF articulation resolution behavior is added.
