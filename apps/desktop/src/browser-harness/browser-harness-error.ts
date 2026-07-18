export class BrowserHarnessError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BrowserHarnessError";
	}
}
