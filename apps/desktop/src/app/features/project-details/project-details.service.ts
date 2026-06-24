import { Injectable, inject } from "@angular/core";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";

@Injectable({ providedIn: "root" })
export class ProjectDetailsService {
	private readonly bridge = inject(DesktopBridgeService);

	pickSource() { return this.bridge.pickSourceFile(); }
	pickAudio() { return this.bridge.pickAudioFile(); }
	pickOutput() { return this.bridge.pickOutputFolder(); }
	pickCover() { return this.bridge.pickCoverImageFile(); }
	coverPreview(imagePath: string) { return this.bridge.getCoverImagePreviewUrl(imagePath); }
}
