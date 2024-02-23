import "dotenv/config";
import { JSONFilePreset } from "lowdb/node";
import type { Data } from "../types/global.js";

const defaultData: Data = { owner: [] };
const DB = await JSONFilePreset<Data>(process.env.DATABASE_FILE!, defaultData);

export default DB;
