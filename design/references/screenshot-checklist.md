# Screenshot Capture Checklist

## Standard capture

Record:

- operating system;
- application version;
- window width and height;
- display scaling;
- whether the sidebar is visible;
- whether a project is loaded;
- whether the backend is healthy.

## Required workflow states

### Shell and navigation

- [ ] App shell with no project.
- [ ] App shell with a loaded project.
- [ ] Modified-project indicator.
- [ ] Generated, needs-regenerate, and failed output statuses when safely reproducible.

### Projects

- [ ] Empty project list.
- [ ] Project list with recent projects.
- [ ] Project details without a source.
- [ ] Project details with a source.

### Source Review

- [ ] No source selected.
- [ ] Analysis loading.
- [ ] Ready with selected tracks.
- [ ] Mapping attention required.
- [ ] Mapping profile selector and actions.
- [ ] Issues expanded.
- [ ] Advanced JSON expanded.
- [ ] Error or warning state when safely reproducible.

### Generation

- [ ] Not ready.
- [ ] Ready.
- [ ] Running.
- [ ] Success.
- [ ] Failure.
- [ ] Logs collapsed or default state.
- [ ] Logs expanded.

### Preview

- [ ] No generated chart.
- [ ] Chart view.
- [ ] Highway view.
- [ ] Playing.
- [ ] Paused.
- [ ] Technical HUD enabled.
- [ ] Narrow window.
- [ ] Wide window.

### Settings

- [ ] Default settings.
- [ ] Changed but unsaved settings, if supported.

## Privacy check

Before committing each screenshot:

- [ ] No API keys.
- [ ] No personal directories.
- [ ] No private song names or source files.
- [ ] No user account information.
- [ ] No unrelated desktop content.
