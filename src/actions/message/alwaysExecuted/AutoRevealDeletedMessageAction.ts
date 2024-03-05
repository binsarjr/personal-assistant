import {
	getContentType,
	isJidGroup,
	isJidStatusBroadcast,
	jidDecode,
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
		logger.debug(message, "AutoRevealDeletedMessageAction: process");
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
		let viewOnceMessage =
			message.message?.viewOnceMessage ||
			message.message?.viewOnceMessageV2 ||
			message.message?.viewOnceMessageV2Extension ||
			message;

		let text = getMessageCaption(message.message!);
		let type = getContentType(message.message!);

		if (
			(
				[
					"imageMessage",
					"videoMessage",
					"audioMessage",
					"documentMessage",
					"documentWithCaptionMessage",
				] as (keyof proto.IMessage)[]
			).includes(type!)
		) {
			if (type === "documentWithCaptionMessage") {
				viewOnceMessage = viewOnceMessage.message?.documentWithCaptionMessage!;
				type = "documentMessage";
				text = viewOnceMessage?.message?.documentMessage?.caption || "";
			}

			const downloadableMedia: DownloadableMessage = {
				directPath:
					viewOnceMessage.message![type as "imageMessage"]?.directPath,
				mediaKey: viewOnceMessage.message![type as "imageMessage"]?.mediaKey,
				url: viewOnceMessage.message![type as "imageMessage"]?.url,
			};
			logger.debug(downloadableMedia, "downloadableMedia");

			const types: { [key in keyof proto.IMessage]: string } = {
				imageMessage: "image",
				videoMessage: "video",
				documentMessage: "document",
				documentWithCaptionMessage: "document",
				audioMessage: "audio",
			};
			this.saveDownloadableMedia(
				// @ts-ignore
				types[type as any],
				message,
				downloadableMedia,
				text,
				viewOnceMessage.message![type as "documentMessage"]?.mimetype,
				viewOnceMessage.message![type as "documentMessage"]?.fileName
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
		const formatterDate = new Intl.DateTimeFormat("id", {
			dateStyle: "full",
			timeStyle: "long",
		});

		let text = "";
		if (isJidGroup(jid)) {
			const metadata = await socket.groupMetadata(jid);
			text += "Grup: *" + metadata.subject + "*\n";
		} else if (isJidStatusBroadcast(jid)) {
			text += "Story Whatsapp\n";
		}

		text += `
User: 
*${message.verifiedBizName || message?.pushName}*

NoHP: 
${jidDecode(message.key.participant || message.key.remoteJid!)?.user}

Waktu Dibuat: 
${formatterDate.format(new Date(data.timestamp))}

Waktu Dihapus: 
${formatterDate.format(new Date())}
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

			const caption = [text, data.caption].join("\n\n").trim();

			QueueMessage.add(async () => {
				let newMessage: AnyMessageContent | null = null;

				if (data.type == "image") {
					newMessage = {
						image: media,
						caption: caption,
					};
				} else if (data.type == "video") {
					newMessage = {
						video: media,
						caption: caption,
					};
				} else if (data.type == "document") {
					newMessage = {
						document: media,
						mimetype: data.mimetype || "application/octet-stream",
						fileName: data.fileName,
						caption: caption,
					};
				} else if (data.type == "audio") {
					newMessage = {
						audio: media,
						mimetype: data.mimetype || "audio/mpeg",
					};
				}

				if (newMessage) {
					const sendMessage = await QueueMessage.add(() =>
						sendWithTyping(
							socket,
							newMessage!,
							jidNormalizedUser(socket.user!.id)
						)
					);
					// needquoted
					if (["audio"].includes(data.type)) {
						await QueueMessage.add(() =>
							sendWithTyping(
								socket,
								{ text: caption },
								jidNormalizedUser(socket.user!.id),
								// @ts-ignore
								{ quoted: sendMessage }
							)
						);
					}
				}
			});
		}
		// Remove the message from the store when already revealed
		delete DB.data.messages[jid][messageId];
	}

	saveDownloadableMedia(
		type: string,
		message: WAMessage,
		media: DownloadableMessage,
		caption?: string,
		mimetype?: string | undefined | null,
		fileName?: string | undefined | null
	): void {
		const jid = getJid(message);
		const messageId = message.key.id;

		DB.data.messages ||= {};
		DB.data.messages[jid] ||= {};

		const mediaHasCaption = ["image", "video", "document", "audio"];
		if (mediaHasCaption.includes(type)) {
			DB.data.messages[jid][messageId!] = {
				type: type as any,
				media,
				timestamp: Date.now(),
				caption,
				mimetype: mimetype || undefined,
				fileName: fileName || undefined,
			};
		}
	}
}
