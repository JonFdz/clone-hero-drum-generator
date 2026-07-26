# Spec: Project Details + Cover Flow

## ADDED Requirements

### Requirement: New Project is Projects-owned

The app SHALL treat New Project as a Projects-owned details flow.

#### Scenario: Create new project

Given the user is on Projects
When the user clicks New Project
Then a new project is initialized
And Project Details opens.

### Requirement: Project Details edits projects

Project Details SHALL allow editing project setup, metadata, offset, and cover.

#### Scenario: Edit existing project

Given a recent project exists
When the user clicks Edit
Then the project is loaded
And Project Details opens for that project.

### Requirement: Cover image is supported

Project Details SHALL allow selecting, previewing, clearing, saving, and reopening a project cover image path.

#### Scenario: Existing project without cover

Given a .chdg file does not contain cover data
When it opens
Then it opens successfully
And Project Details shows a cover placeholder.

### Requirement: Projects supports Select/Edit/Remove

Projects project cards SHALL show Select, Edit, and Remove actions.

#### Scenario: Select project

When the user clicks Select
Then the project becomes active/current.

### Requirement: Remove has two confirmed paths

Remove SHALL require confirmation and offer recents-only or recents-plus-delete-file.

#### Scenario: Remove from recents only

When the user confirms Remove from Recents
Then the recent entry is removed
And the .chdg file remains on disk.

#### Scenario: Remove and delete file

When the user confirms Remove from Recents and Delete File
Then the recent entry is removed
And only the .chdg file is deleted from disk.

## MODIFIED Requirements

### Requirement: Standalone New Project route is replaced

The old New Project screen is replaced by Project Details under Projects.

## REMOVED Requirements

None.
