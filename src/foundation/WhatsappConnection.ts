import * as baileys from "@whiskeysockets/baileys";
import logger from "../services/logger.js";
import type WhatsappAuthStore from "./WhatsappAuthStore.js";

export default class {
	protected socket!: baileys.WASocket;
	constructor(protected readonly authStore: WhatsappAuthStore) {}

	public async connectToWhatsapp(): Promise<void> {
		const { state, saveCreds } = await this.authStore.authentication();
		const { version, isLatest } = await baileys.fetchLatestBaileysVersion();
		logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

		this.socket = baileys.makeWASocket({
			version,
			auth: {
				creds: state.creds,
				keys: state.keys,
			},
			generateHighQualityLinkPreview: true,
			printQRInTerminal: true,
		});
		this.resolveClientConnection();
		this.resolveCredentialSaver(saveCreds);
		// this.resolveMessagesUpsert()
	}

	protected resolveClientConnection(): void {
		this.socket.ev.on("connection.update", (update) => {
			const { connection, lastDisconnect } = update;

			const shouldReconnect: boolean =
				connection === "close" &&
				(lastDisconnect?.error as any)?.output?.statusCode !==
					baileys.DisconnectReason.loggedOut;

			if (shouldReconnect) {
				logger.warning("connection closed due to ");
				logger.error(lastDisconnect?.error?.toString() as string);
				logger.warning(
					shouldReconnect ? "reconnecting" : "not reconnecting due to error",
					"shouldReconnect"
				);

				return this.connectToWhatsapp();
			}

			if (connection === "open") {
				logger.info("opened connection");
			}

			return;
		});
	}
	protected resolveCredentialSaver(saveCreds: () => Promise<void>): void {
		this.socket.ev.on("creds.update", saveCreds);
	}
}
