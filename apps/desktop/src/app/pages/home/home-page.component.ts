import { Component } from "@angular/core";

@Component({
  selector: "chdg-home-page",
  standalone: true,
  template: `
    <header class="page-header">
      <p class="eyebrow">Local desktop shell</p>
      <h1>Welcome to CHDG.</h1>
      <p>Build Clone Hero drum packages from local MIDI and Guitar Pro / GPIF sources. Phase 10 establishes the desktop foundation only.</p>
    </header>

    <div class="grid two">
      <section class="card">
        <h2>Workflow overview</h2>
        <div class="workflow" aria-label="Planned desktop workflow">
          @for (step of workflow; track step.label) {
            <div class="workflow-step">
              <div class="step-icon" aria-hidden="true">{{ step.icon }}</div>
              <strong>{{ step.label }}</strong>
              <p>{{ step.description }}</p>
            </div>
          }
        </div>
      </section>

      <section class="card">
        <h2>System status</h2>
        <div class="card-list">
          <div class="mini-card"><span class="pill">Offline first</span><p>No uploads, URLs, scraping, or YouTube imports.</p></div>
          <div class="mini-card"><span class="pill">Project format</span><p>.chdg is the future project file; Clone Hero output is a folder with notes.chart, song.ini, and song.ogg.</p></div>
          <div class="mini-card"><span class="pill">Shell only</span><p>Generation, persistence, preview, validation checklist, and mapping overrides are deferred.</p></div>
        </div>
      </section>
    </div>
  `,
})
export class HomePageComponent {
  readonly workflow = [
    { icon: "↓", label: "Import source", description: "Use local .mid, .midi, or .gp / GPIF files." },
    { icon: "⌕", label: "Inspect", description: "Review source structure before generation." },
    { icon: "♬", label: "Select track(s)", description: "Choose drum candidates in a future phase." },
    { icon: "✦", label: "Generate", description: "Create the Clone Hero song folder later." },
    { icon: "◇", label: "Validate", description: "Check generated package consistency." },
    { icon: "▷", label: "Preview", description: "Review notes.chart with song.ogg in future phases." },
  ];
}
