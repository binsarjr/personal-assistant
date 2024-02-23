import ExitAction from "./actions/system/ExitAction.js";
import DB from "./services/database.js";
import logger from "./services/logger.js";
import { loadEnv } from "./supports/env.js";

loadEnv();

new ExitAction().execute();

/**
 * Save database every 1 minute
 */
setInterval(async () => {
	logger.info("Saving database...");
	await DB.write();
	logger.info("Database saved.");
}, 1_000 * 60);
