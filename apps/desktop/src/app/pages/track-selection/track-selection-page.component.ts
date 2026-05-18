import { Component } from "@angular/core";

@Component({
  selector: "chdg-track-selection-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">Track Selection</p><h1>Track selection placeholder</h1><p>Multi-track selection is planned, but no multi-track generation is implemented in Phase 10.</p></header>
    <section class="card"><h2>Canonical future merge rules</h2><ul class="placeholder-list"><li>Merge selected complementary tracks</li><li>Deduplicate identical hits</li><li>Open hi-hat wins over closed hi-hat</li><li>Conflicts reported; source timing preserved</li></ul></section>
  `,
})
export class TrackSelectionPageComponent {}
