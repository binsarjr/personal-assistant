import ExitAction from "./actions/system/ExitAction.js";
import DB from "./services/database.js";
import { loadEnv } from "./supports/env.js";

loadEnv();

new ExitAction().execute();

while (true) {
	console.log("oke", process.env.DATABASE_FILE);
	await new Promise((resolve) => setTimeout(resolve, 1000));
}
console.log(DB.chain.get("owner").value());
