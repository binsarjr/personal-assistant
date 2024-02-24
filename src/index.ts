import "./bootstrap.js";
import WhatsappClient from "./foundation/WhatsappClient.js";

const client = new WhatsappClient(process.env.BOT_NAME!);
client.start();
