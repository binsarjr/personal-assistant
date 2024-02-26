import {
	downloadMediaMessage,
	jidNormalizedUser,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { QueueMessage } from "../../../services/queue.js";
import { react, sendWithTyping } from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

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
		const viewOnceMessage =
			message.message?.viewOnceMessage ||
			message.message?.viewOnceMessageV2 ||
			message.message?.viewOnceMessageV2Extension ||
			message;

		const isViewOnce =
			viewOnceMessage?.message?.imageMessage?.viewOnce ||
			viewOnceMessage?.message?.videoMessage?.viewOnce;

		if (isViewOnce) {
			const image = viewOnceMessage?.message?.imageMessage;
			const video = viewOnceMessage?.message?.videoMessage;
			const caption = image?.caption || video?.caption;
			react(socket, "👀", message);
			let text = `View Once Message Revealed\n`;
			if (caption) {
				text += `Caption: ${caption}\n`;
			}

			const media = await downloadMediaMessage(message, "buffer", {});

			text = text.trim();
			if (image) {
				QueueMessage.add(() =>
					sendWithTyping(
						socket,
						{
							image: media as Buffer,
							caption: text,
						},
						jidNormalizedUser(socket.user?.id!),

						{ quoted: message }
					)
				);
			} else if (video) {
				QueueMessage.add(() =>
					sendWithTyping(
						socket,
						{
							video: media as Buffer,
							caption: text,
						},
						jidNormalizedUser(socket.user?.id!),

						{ quoted: message }
					)
				);
			}
		}
	}
}
