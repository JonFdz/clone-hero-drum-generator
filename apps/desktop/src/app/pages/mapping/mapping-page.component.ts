import { Component } from "@angular/core";

@Component({
  selector: "chdg-mapping-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">Mapping</p><h1>Mapping placeholder</h1><p>Project-level mapping overrides are deferred to a later phase.</p></header>
    <section class="card"><h2>Future target labels</h2><ul class="placeholder-list"><li>Snare</li><li>Closed Hi-Hat</li><li>Open Hi-Hat</li><li>Crash</li><li>Ride</li><li>Tom</li><li>Ignore</li></ul></section>
  `,
})
export class MappingPageComponent {}
