export class BrowserHarnessError extends Error {
	constructor(message: string) {
		super(`BrowserHarnessError: ${message}`);
		this.name = "BrowserHarnessError";
	}
}
