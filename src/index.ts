import ExitAction from "./actions/system/ExitAction.js";
import WhatsappClient from "./foundation/WhatsappClient.js";
import { loadEnv } from "./supports/env.js";

loadEnv();

new ExitAction().execute();

const client = new WhatsappClient("bangbin");
client.start();
