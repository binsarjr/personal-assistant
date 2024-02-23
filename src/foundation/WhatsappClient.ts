import type WhatsappClient from "../contracts/foundation/WhatsappClient.js";
import WhatsappAuthStore from "./WhatsappAuthStore.js";
import WhatsappConnection from "./WhatsappConnection.js";

export default class implements WhatsappClient {
	constructor(public readonly sessionId: string) {}
	async start() {
		const connection = new WhatsappConnection(
			new WhatsappAuthStore(this.sessionId)
		);
		await connection.connectToWhatsapp();
	}
}
