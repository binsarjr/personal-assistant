import {
	MessageUpsertType,
	downloadMediaMessage,
	proto,
} from "@whiskeysockets/baileys";
import type { ChatType } from "../Contracts/ChatType";
import { HandlerArgs } from "../Contracts/IEventListener";
import { MessageUpsert } from "../Facades/Events/Message/MessageUpsert";
import Queue from "../Facades/Queue";
import { sendMessageWTyping } from "../utils";

export class AutoRevealOnceView extends MessageUpsert {
	chat: ChatType = "all";
	type: MessageUpsertType | "all" = "all";
	async handler({
		socket,
		props,
	}: HandlerArgs<{
		message: proto.IWebMessageInfo;
		type: MessageUpsertType;
	}>): Promise<void> {
		const jid = props.message.key.remoteJid || "";
		const viewOnceMessage =
			props.message.message?.viewOnceMessage ||
			props.message.message?.viewOnceMessageV2 ||
			props.message.message?.viewOnceMessageV2Extension;

		const isViewOnce = !!viewOnceMessage;
		if (isViewOnce) {
			const image = viewOnceMessage?.message?.imageMessage;
			const video = viewOnceMessage?.message?.videoMessage;
			const caption = image?.caption || video?.caption;

			let text = `👀 View Once Message Revealed 👀\n`;
			if (caption) {
				text += `Caption: ${caption}\n`;
			}
			const media = await downloadMediaMessage(props.message, "buffer", {});

			text = text.trim();
			if (image) {
				Queue(() =>
					sendMessageWTyping(
						{
							image: media as Buffer,
							caption: text,
						},
						jid,
						socket,
						{ quoted: props.message }
					)
				);
			} else if (video) {
				Queue(() =>
					sendMessageWTyping(
						{
							video: media as Buffer,
							caption: text,
						},
						jid,
						socket,
						{ quoted: props.message }
					)
				);
			}
		}
	}
}
