import { Component } from "@angular/core";

@Component({
  selector: "chdg-projects-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">Projects</p><h1>Project library placeholder</h1><p>Future project persistence will list local .chdg project files here.</p></header>
    <section class="card"><h2>Planned local source types</h2><ul class="placeholder-list"><li>MIDI</li><li>Guitar Pro / GPIF</li><li>Mixed</li><li>Draft / Unknown</li></ul></section>
  `,
})
export class ProjectsPageComponent {}
