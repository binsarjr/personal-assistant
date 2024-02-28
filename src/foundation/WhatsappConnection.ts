import * as baileys from "@whiskeysockets/baileys";
import ResolveMessageAction from "../actions/message/ResolveMessageAction.js";
import logger from "../services/logger.js";
import type WhatsappAuthStore from "./WhatsappAuthStore.js";

export default class {
	protected socket!: baileys.WASocket;
	public status: baileys.WAConnectionState = "close";
	constructor(protected readonly authStore: WhatsappAuthStore) {}

	public async connectToWhatsapp(): Promise<void> {
		const { state, saveCreds } = await this.authStore.authentication();
		const { version, isLatest } = await baileys.fetchLatestBaileysVersion();
		logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

		this.socket = baileys.makeWASocket({
			version,
			// @ts-ignore
			logger,
			auth: {
				creds: state.creds,
				keys: state.keys,
			},
			generateHighQualityLinkPreview: true,
			printQRInTerminal: true,
			// syncFullHistory: true,
		});

		this.socket.ev.on("messaging-history.set", (data) => {
			logger.debug("messaging-history.set", data);
		});
		this.resolveClientConnection();
		this.resolveCredentialSaver(saveCreds);
		this.resolveMessagesUpsert();
	}

	protected resolveClientConnection(): void {
		this.socket.ev.on("connection.update", (update) => {
			const { connection, lastDisconnect } = update;
			if (connection) this.status = connection;

			const shouldReconnect: boolean =
				connection === "close" &&
				(lastDisconnect?.error as any)?.output?.statusCode !==
					baileys.DisconnectReason.loggedOut;

			if (shouldReconnect) {
				logger.warn(
					"connection closed due to ",
					lastDisconnect?.error,
					", reconnecting ",
					shouldReconnect
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

	protected resolveMessagesUpsert() {
		this.socket.ev.on(
			"messages.upsert",
			(messages: baileys.BaileysEventMap["messages.upsert"]) =>
				ResolveMessageAction.execute(this.socket, messages)
		);
	}
}
