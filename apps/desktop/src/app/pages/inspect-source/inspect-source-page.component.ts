import { Component } from "@angular/core";

@Component({
  selector: "chdg-inspect-source-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">Inspect Source</p><h1>Source inspection placeholder</h1><p>Future phases will surface structured inspection data from local chart sources.</p></header>
    <section class="card"><h2>Planned inspection data</h2><ul class="placeholder-list"><li>Source type and file path</li><li>Resolution / PPQ, tempo map, time signatures, and sections</li><li>Tracks, drum candidates, unknown notes/articulations, and warnings</li><li>View JSON once structured project services exist</li></ul></section>
  `,
})
export class InspectSourcePageComponent {}
