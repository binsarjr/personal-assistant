import { type WAMessage, type WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSign } from "../../../supports/flag.js";
import { getJid, sendWithTyping } from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return [withSign("tagmem"), withSign("tagmember")];
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		const isMeAndInGroup =
			!!message.key.fromMe && super.isEligibleToProcess(socket, message);
		return isMeAndInGroup;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const metadata = await socket.groupMetadata(getJid(message));

		await QueueMessage.add(() =>
			sendWithTyping(
				socket,
				{
					text: "PING!!",
					mentions: metadata.participants
						.filter((participant) => !participant.admin)
						.map((participant) => participant.id),
				},
				getJid(message),
				{ quoted: message }
			)
		);
		this.reactToDone(socket, message);
	}
}
