import { Component } from "@angular/core";

@Component({
  selector: "chdg-settings-page",
  standalone: true,
  template: `
    <header class="page-header"><p class="eyebrow">Settings</p><h1>Settings</h1><p>Configure local app behavior. Controls are placeholders until project services and persistence exist.</p></header>
    <div class="grid two">
      <section class="card"><h2>General</h2><div class="setting-row"><div><strong>Theme</strong><p>Light mode can be added in a future update.</p></div><span class="input-like">Dark</span></div><div class="setting-row"><div><strong>Accent color</strong><p>Purple accent matches the Phase 10 visual direction.</p></div><span class="pill">Purple</span></div><div class="setting-row"><div><strong>Project location</strong><p>Default future location for local .chdg projects.</p></div><span class="input-like">~/Documents/CHDG Projects</span></div></section>
      <section class="card"><h2>Diagnostics</h2><div class="setting-row"><div><strong>Backend Status</strong><p>Provided through the secure preload bridge.</p></div><span class="pill">Connected</span></div><div class="setting-row"><div><strong>Local-only / Offline</strong><p>No internet required.</p></div><span class="pill">Enabled</span></div><div class="setting-row"><div><strong>Project Format</strong><p>Future project file extension.</p></div><span class="input-like">.chdg</span></div></section>
    </div>
  `,
})
export class SettingsPageComponent {}
