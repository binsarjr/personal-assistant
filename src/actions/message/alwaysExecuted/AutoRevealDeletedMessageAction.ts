import {
	getContentType,
	isJidGroup,
	jidNormalizedUser,
	proto,
	type AnyMessageContent,
	type DownloadableMessage,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import DB from "../../../services/database.js";
import logger from "../../../services/logger.js";
import { QueueMessage } from "../../../services/queue.js";
import {
	downloadContentBufferFromMessage,
	getJid,
	getMessageCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return true;
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		this.removeIfMoreThen4Hours();
		return !message.key.fromMe;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		logger.debug(
			message.message?.productMessage,
			"AutoRevealDeletedMessageAction: process"
		);
		const protocol = JSON.parse(JSON.stringify(message.message)) as {
			protocolMessage: {
				key: {
					remoteJid: string;
					fromMe: boolean;
					id: string;
				};
				type: "REVOKE";
			};
		};

		if (protocol?.protocolMessage?.type === "REVOKE") {
			this.processReveal(socket, message, protocol.protocolMessage.key.id);
		} else {
			this.processSaveToStore(socket, message);
		}
	}

	async processSaveToStore(
		socket: WASocket,
		message: WAMessage
	): Promise<void> {
		const viewOnceMessage =
			message.message?.viewOnceMessage ||
			message.message?.viewOnceMessageV2 ||
			message.message?.viewOnceMessageV2Extension ||
			message;

		const text = getMessageCaption(message.message!);
		const type = getContentType(message.message!);

		if (
			(["imageMessage", "videoMessage"] as (keyof proto.IMessage)[]).includes(
				type!
			)
		) {
			const downloadableMedia: DownloadableMessage = {
				directPath:
					viewOnceMessage.message![type as "imageMessage"]?.directPath,
				mediaKey: viewOnceMessage.message![type as "imageMessage"]?.mediaKey,
				url: viewOnceMessage.message![type as "imageMessage"]?.url,
			};
			this.saveDownloadableMedia(
				type == "imageMessage" ? "image" : "video",
				message,
				downloadableMedia,
				text
			);
		} else {
			this.saveTextOnlyMessage(viewOnceMessage as WAMessage);
		}
	}

	removeIfMoreThen4Hours() {
		const now = Date.now();
		for (const jid in DB.data.messages) {
			for (const messageId in DB.data.messages[jid]) {
				if (
					now - DB.data.messages[jid][messageId].timestamp >
					4 * 60 * 60 * 1000
				) {
					delete DB.data.messages[jid][messageId];
				}
			}
		}
	}

	saveTextOnlyMessage(message: WAMessage): void {
		const jid = getJid(message);
		const messageId = message.key.id;

		DB.data.messages ||= {};
		DB.data.messages[jid] ||= {};
		DB.data.messages[jid][messageId!] = {
			type: "text",
			text: getMessageCaption(message.message!),
			timestamp: Date.now(),
		};
	}
	async processReveal(
		socket: WASocket,
		message: WAMessage,
		messageId: string
	): Promise<void> {
		const jid = getJid(message);
		const data = DB.data.messages[jid][messageId || ""];
		if (!data) return;
		const formattedDate = new Intl.DateTimeFormat("id", {
			dateStyle: "full",
			timeStyle: "long",
		}).format(new Date(data.timestamp));

		let text = "";
		if (isJidGroup(jid)) {
			const metadata = await socket.groupMetadata(jid);
			text += "Grup: *" + metadata.subject + "*\n";
		}

		text += `
User: *${message?.pushName}*
Waktu: ${formattedDate}
    `.trim();

		if (data.type == "text") {
			QueueMessage.add(async () => {
				await sendWithTyping(
					socket,
					{ text: [text, data.text].join("\n\n").trim() },
					jidNormalizedUser(socket.user!.id)
				);
			});
		} else {
			const media = (await downloadContentBufferFromMessage(
				data.media,
				data.type
			)) as Buffer;

			QueueMessage.add(async () => {
				let newMessage: AnyMessageContent | null = null;

				if (data.type == "image") {
					newMessage = {
						image: media,
						caption: [text, data.caption].join("\n\n").trim(),
					};
				} else if (data.type == "video") {
					newMessage = {
						video: media,
						caption: [text, data.caption].join("\n\n").trim(),
					};
				}

				if (newMessage)
					await sendWithTyping(
						socket,
						newMessage,
						jidNormalizedUser(socket.user!.id)
					);
			});
		}
	}

	saveDownloadableMedia(
		type: "image" | "video",
		message: WAMessage,
		media: DownloadableMessage,
		caption?: string
	): void {
		const jid = getJid(message);
		const messageId = message.key.id;

		DB.data.messages ||= {};
		DB.data.messages[jid] ||= {};
		DB.data.messages[jid][messageId!] = {
			type,
			media,
			timestamp: Date.now(),
			caption,
		};
	}
}
