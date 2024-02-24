import type WhatsappClient from "../contracts/foundation/WhatsappClient.js";
import WhatsappAuthStore from "./WhatsappAuthStore.js";
import WhatsappConnection from "./WhatsappConnection.js";

export default class implements WhatsappClient {
	public readonly connection: WhatsappConnection;
	constructor(public readonly sessionId: string) {
		this.connection = new WhatsappConnection(
			new WhatsappAuthStore(this.sessionId)
		);
	}

	async start() {
		await this.connection.connectToWhatsapp();
	}
}
