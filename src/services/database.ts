import "dotenv/config";
import lodash from "lodash";
import { Low } from "lowdb";
import { DataFile } from "lowdb/node";
import type { Data } from "../types/global.js";

class LowWithLodash<T> extends Low<T> {
	chain: lodash.ExpChain<this["data"]> = lodash.chain(this).get("data");
}

const defaultData: Data = { owner: [], auths: {} };

const adapter = new DataFile<Data>(process.env.DATABASE_FILE!, {
	parse: JSON.parse,
	stringify: JSON.stringify,
});

const DB = new LowWithLodash(adapter, defaultData);
await DB.read();

/**
 * Inisialisasi data default jika tidak ada
 */
for (const key of Object.keys(defaultData)) {
	// @ts-ignore
	if (DB.data[key] === undefined) DB.data[key] = defaultData[key];
}

export default DB;
