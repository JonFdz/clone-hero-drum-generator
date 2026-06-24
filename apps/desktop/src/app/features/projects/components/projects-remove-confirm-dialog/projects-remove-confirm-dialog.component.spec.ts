import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsRemoveConfirmDialogComponent } from "./projects-remove-confirm-dialog.component";

describe("ProjectsRemoveConfirmDialogComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsRemoveConfirmDialogComponent(); c.isOpen=true; let called=false; c.cancelled.subscribe(()=>called=true); c.onEscape(); expect(called).toBe(true); });
});
