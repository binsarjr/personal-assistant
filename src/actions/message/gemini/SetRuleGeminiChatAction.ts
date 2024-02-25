import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import DB from "../../../services/database.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSignRegex } from "../../../supports/flag.js";
import {
	getJid,
	getMessageCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return withSignRegex("setrule .*");
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		const jid = getJid(message);
		console.log(DB.data.gemini[process.env.BOT_NAME!]);
		return (
			!!message.key.fromMe &&
			DB.data.gemini[process.env.BOT_NAME!][jid] !== undefined
		);
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const jid = getJid(message);
		const rule = getMessageCaption(message.message!)
			.replace(process.env.DATABASE_FILE + "setrule ", "")
			.trim();

		DB.data.gemini[process.env.BOT_NAME!][jid].rules = [rule];

		QueueMessage.add(async () => {
			await sendWithTyping(
				socket,
				{
					text: `
Rule berhasil di set.

          `.trim(),
				},
				jid,
				{ quoted: message }
			);
			await this.reactToDone(socket, message);
		});
	}
}
