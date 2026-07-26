import { Injectable, inject } from "@angular/core";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";

@Injectable({ providedIn: "root" })
export class ProjectDetailsService {
	private readonly bridge = inject(DesktopBridgeService);

	coverPreview(imagePath: string) { return this.bridge.getCoverImagePreviewUrl(imagePath); }
}
