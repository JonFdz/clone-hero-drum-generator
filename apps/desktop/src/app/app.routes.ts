import type { Routes } from "@angular/router";
import { HomePageComponent } from "./features/home/home-page.component";

export const routes: Routes = [
	{ path: "", pathMatch: "full", redirectTo: "home" },
	// Home stays eagerly loaded.
	{ path: "home", component: HomePageComponent },
	// Feature routes are lazy-loaded via loadComponent.
	{
		path: "projects",
		loadComponent: () =>
			import("./features/projects/projects-page.component").then(
				(m) => m.ProjectsPageComponent,
			),
	},
	{
		path: "projects/details",
		loadComponent: () =>
			import("./features/project-details/project-details-page.component").then(
				(m) => m.ProjectDetailsPageComponent,
			),
	},
	{ path: "new-project", redirectTo: "projects/details" },
	{
		path: "source-review",
		loadComponent: () =>
			import("./pages/source-review/source-review-page.component").then(
				(m) => m.SourceReviewPageComponent,
			),
	},
	{ path: "inspect-source", redirectTo: "source-review" },
	{ path: "track-selection", redirectTo: "source-review" },
	{ path: "mapping", redirectTo: "source-review" },
	{
		path: "generate",
		loadComponent: () =>
			import("./pages/generate/generate-page.component").then(
				(m) => m.GeneratePageComponent,
			),
	},
	{ path: "validation", redirectTo: "generate" },
	{
		path: "preview",
		loadComponent: () =>
			import("./pages/preview/preview-page.component").then(
				(m) => m.PreviewPageComponent,
			),
	},
	{
		path: "settings",
		loadComponent: () =>
			import("./features/settings/settings-page.component").then(
				(m) => m.SettingsPageComponent,
			),
	},
	{ path: "**", redirectTo: "home" },
];
