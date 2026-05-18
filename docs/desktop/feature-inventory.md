# Desktop Feature Inventory

## Already backend-ready

| Feature | Status |
|---|---|
| Open MIDI | Backend ready; desktop UI needed |
| Open GP | Backend ready; desktop UI needed |
| Generate package from MIDI | Ready |
| Generate package from GPIF/.gp | Ready |
| notes.chart output | Ready |
| song.ini output | Ready |
| song.ogg output | Ready |
| Metadata options | Ready in backend |
| Offset ms -> chart Offset seconds | Ready in backend |
| MIDI inspection | Ready in backend |
| GPIF inspection | Ready in backend |
| Track selection by explicit index | Ready in backend |
| Drum normalization | Ready in backend |
| Piece summary | Available in backend reports |
| First hits | Available in backend reports |
| Unknown notes/articulations | Available in backend reports |
| Pro Drums cymbals | Ready |
| Open hi-hat | Ready |
| Ghost/accent | Ready |
| Sections/global events | Partial/ready where source provides them |

## Needs near-term desktop/backend work

| Feature | Needed work |
|---|---|
| Desktop shell | Electron + Angular app |
| Native file picker | Electron main/preload bridge |
| Drag and drop | Angular UI |
| Backend connected status | Health check bridge |
| Structured services | `packages/project` |
| CLI JSON | `--json` output for key commands |
| Multi-track selection | `--tracks` + UI combined summary |
| Multi-track merge warnings | impossible hand chord warnings |
| Project file | `.chdg` JSON project state |
| Recent projects | local persistence |
| Settings | local persistence |
| FFmpeg path config | tool settings + validation |
| Open output folder | shell integration |
| Generation logs | structured progress/log events |
| Validation checklist | package validator |
| Copy/export report | report writer |
| Structured inspection views | JSON/API output |
| Track confidence badges | heuristic scoring model |
| Mapping preview timeline | UI visualization from structured hits |

## Larger future features

| Feature | Required phases |
|---|---|
| Audio waveform preview | Phase 14A |
| Audio + notes sync | Phase 14A |
| Clone Hero-style highway preview | Phase 14B |
| Offset adjustment loop | Phase 15 |
| Project mapping overrides | Phase 16A |
| Mapping override profiles | Phase 16B |
| Desktop packaging/distribution | Phase 17 |
| Optional external editor integration | Phase 18 |
| Individual note editing | Phase 19 |
| Automatic offset detection | Deferred beyond current roadmap |
