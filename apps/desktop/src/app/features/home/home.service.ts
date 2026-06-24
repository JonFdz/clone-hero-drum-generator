import { Injectable, inject } from "@angular/core";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";

@Injectable({ providedIn: "root" })
export class HomeService {
	private readonly bridge = inject(DesktopBridgeService);
	openOutputFolder(path: string) {
		return this.bridge.openOutputFolder(path);
	}
}
