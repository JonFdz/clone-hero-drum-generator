import {
	ChangeDetectionStrategy,
	Component,
	type OnInit,
	computed,
	inject,
} from "@angular/core";
import {
	Router,
	RouterLink,
	RouterLinkActive,
	RouterOutlet,
} from "@angular/router";
import { ApplicationStartupService } from "./core/application-startup.service";
import {
	PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE,
	ProjectPersistenceService,
	ProjectSessionStore,
	ProjectWorkflowHydrator,
} from "./features/project-session/public-api";
import { desktopRuntimeStatusLabel } from "./services/desktop-bridge-model";

type NavItem = {
	label: string;
	path: string;
	icon: string;
};

@Component({
	selector: "chdg-root",
	standalone: true,
	imports: [RouterOutlet, RouterLink, RouterLinkActive],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.css",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	private readonly startup = inject(ApplicationStartupService);
	private readonly session = inject(ProjectSessionStore);
	private readonly persistence = inject(ProjectPersistenceService);
	private readonly workflowHydrator = inject(ProjectWorkflowHydrator);
	private readonly router = inject(Router);

	readonly navItems: NavItem[] = [
		{ label: "Home", path: "/home", icon: "⌂" },
		{ label: "Projects", path: "/projects", icon: "□" },
		{ label: "Source Review", path: "/source-review", icon: "╕" },
		{ label: "Generate", path: "/generate", icon: "✦" },
		{ label: "Preview", path: "/preview", icon: "▷" },
		{ label: "Settings", path: "/settings", icon: "⚙" },
	];

	readonly appVersion = computed(
		() =>
			this.startup.appInfo()?.version ??
			this.startup.health().appVersion,
	);
	readonly health = this.startup.health;
	readonly runtimeStatusLabel = computed(() =>
		desktopRuntimeStatusLabel(this.health()),
	);
	readonly project = this.session.state;
	readonly persistenceUnavailableMessage =
		PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE;

	async ngOnInit(): Promise<void> {
		await this.startup.initialize();
	}

	isHomeRoute(): boolean {
		return this.router.url === "/home" || this.router.url === "/";
	}

	saveProject(): void {
		// Disabled in the template until canonical save orchestration exists.
	}

	saveProjectAs(): void {
		// Disabled in the template until canonical Save a Copy exists.
	}

	async openProject(): Promise<void> {
		const result = await this.persistence.openProjectFromPicker();
		if (!result.ok) {
			return;
		}
		this.workflowHydrator.hydrate(result.payload);
		await this.startup.refreshRecentProjects();
		await this.router.navigateByUrl("/projects/details");
	}
}
