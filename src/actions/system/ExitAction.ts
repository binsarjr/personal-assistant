import type { BaseAction } from "../../contracts/actions/BaseAction.js";
import DB from "../../services/database.js";
import logger from "../../services/logger.js";

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
		console.log();
		this.exiting = true;
		await callback();
		this.exiting = false;

		logger.info("Aplikasi berhasil keluar.");

		process.exit();
	}

	protected async handlerBeforeExit() {
		this.handlerExiting(async () => {
			logger.warning("Aplikasi akan keluar...");
			await new Promise((resolve) => setTimeout(resolve, 5000));
			logger.info("Database sedang disimpan...");
			await DB.write();
			logger.info("Database berhasil disimpan.");
		});
	}

	protected async handlerSigInt() {
		this.handlerBeforeExit();
	}
}
