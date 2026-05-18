import { Component } from "@angular/core";

@Component({
  selector: "chdg-preview-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">Preview</p><h1>Preview placeholder</h1><p>The preview player is deferred. Future preview should read notes.chart + song.ogg.</p></header>
    <section class="card"><h2>Offset wording</h2><p>Chart Offset uses milliseconds in the UI and is stored in notes.chart Offset. Positive values delay chart notes relative to audio.</p></section>
  `,
})
export class PreviewPageComponent {}
