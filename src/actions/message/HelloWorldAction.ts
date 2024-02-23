import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../foundation/actions/BaseMessageHandlerAction.js";
import { QueueMessage } from "../../services/queue.js";
import { getJid, sendWithTyping } from "../../supports/message.js";
import type { MessagePattern } from "../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return true;
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return !message.key.fromMe;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		await QueueMessage.add(() => this.reactToProcessing(socket, message));
		await QueueMessage.add(() =>
			sendWithTyping(socket, { text: "Hello World!" }, getJid(message), {
				quoted: message,
			})
		);
		await QueueMessage.add(() => this.reactToDone(socket, message));
	}
}
