import { Component } from "@angular/core";

@Component({
  selector: "chdg-new-project-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">New Project</p><h1>New project placeholder</h1><p>Real file picker and .chdg project creation are deferred. This screen documents the planned local-only inputs.</p></header>
    <div class="grid two"><section class="card"><h2>Planned inputs</h2><ul class="placeholder-list"><li>Source File — supports .mid, .midi, .gp / GPIF</li><li>Audio File — required for Desktop Generate MVP</li><li>Output Folder — project/output location</li><li>Chart Offset (ms) — stored in notes.chart Offset</li></ul></section><section class="card"><h2>Not in Phase 10</h2><p>No real file picker flow, project persistence, or .chdg read/write is implemented here.</p></section></div>
  `,
})
export class NewProjectPageComponent {}
