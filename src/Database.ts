import { Config, JsonDB } from 'node-json-db'


export const DB = new JsonDB(new Config("database", true, false, '/'));
