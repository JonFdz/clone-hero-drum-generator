import type { Routes } from "@angular/router";
import { GeneratePageComponent } from "./pages/generate/generate-page.component";
import { HomePageComponent } from "./pages/home/home-page.component";
import { InspectSourcePageComponent } from "./pages/inspect-source/inspect-source-page.component";
import { MappingPageComponent } from "./pages/mapping/mapping-page.component";
import { ProjectDetailsPageComponent } from "./pages/projects/project-details/project-details-page.component";
import { PreviewPageComponent } from "./pages/preview/preview-page.component";
import { ProjectsPageComponent } from "./pages/projects/projects-page.component";
import { SettingsPageComponent } from "./pages/settings/settings-page.component";
import { TrackSelectionPageComponent } from "./pages/track-selection/track-selection-page.component";
import { ValidationPageComponent } from "./pages/validation/validation-page.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "home" },
  { path: "home", component: HomePageComponent },
  { path: "projects", component: ProjectsPageComponent },
  { path: "projects/details", component: ProjectDetailsPageComponent },
  { path: "new-project", redirectTo: "projects/details" },
  { path: "inspect-source", component: InspectSourcePageComponent },
  { path: "track-selection", component: TrackSelectionPageComponent },
  { path: "generate", component: GeneratePageComponent },
  { path: "validation", component: ValidationPageComponent },
  { path: "preview", component: PreviewPageComponent },
  { path: "mapping", component: MappingPageComponent },
  { path: "settings", component: SettingsPageComponent },
  { path: "**", redirectTo: "home" },
];
