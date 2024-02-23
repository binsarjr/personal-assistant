import type { BaseAction } from "../../contracts/actions/BaseAction.js";
import DB from "../../services/database.js";

export default class implements BaseAction {
	exiting = false;
	async execute() {
		process.on("beforeExit", () => this.handlerBeforeExit());
		process.on("SIGINT", () => this.handlerSigInt());
	}

	/**
	 * handle redundant code for exiting
	 */
	protected async handlerExiting(callback: () => Promise<void>) {
		if (this.exiting) return;
		this.exiting = true;
		await callback();
		this.exiting = false;
		process.exit();
	}

	protected async handlerBeforeExit() {
		this.handlerExiting(async () => {
			console.log("Aplikasi akan keluar...");

			console.log("Saving...");
			await DB.write();
			console.log("Saved");

			console.log("Eksekusi sebelum keluar selesai.");
		});
	}

	protected async handlerSigInt() {
		this.handlerExiting(async () => {
			console.log("Aplikasi menerima sinyal SIGINT (Ctrl+C).");

			console.log("Saving...");
			await DB.write();
			console.log("Saved");
		});
	}
}
