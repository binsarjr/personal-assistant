import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import DB from "../../../services/database.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSignRegex } from "../../../supports/flag.js";
import { getJid } from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return withSignRegex("reset");
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		const jid = getJid(message);
		return (
			!!message.key.fromMe &&
			DB.data.gemini[process.env.BOT_NAME!][jid] !== undefined
		);
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const jid = getJid(message);
		DB.data.gemini[process.env.BOT_NAME!][jid].history = [];

		QueueMessage.add(async () => {
			await this.reactToDone(socket, message);
		});
	}
}
