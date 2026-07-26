# Design: Phase 17F — Project Details + Cover Flow

## Route

Preferred:

```txt
/projects/details
```

Old `/new-project` may redirect for compatibility.

## Data flow

New Project from Projects:

```txt
createProject(name or default)
load returned project state
navigate /projects/details
```

Edit:

```txt
open project if needed
load state
navigate /projects/details
```

Select:

```txt
open project
load state
stay on Projects and mark current
```

## Cover

Persist optional local path:

```ts
cover?: {
  imagePath?: string;
}
```

or equivalent.

The cover path is selected through a trusted Electron dialog.

## Delete

Deletion path:

```txt
Projects Remove -> confirm -> Remove from Recents and Delete File
```

Delete method:

```txt
validate .chdg path
delete file
remove from recents
if current, reset state
```

## UI

Project Details should reuse old New Project behavior but with mock-accurate design and cover card.
