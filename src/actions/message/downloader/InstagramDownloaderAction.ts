import { type WAMessage, type WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSignRegex } from "../../../supports/flag.js";
import {
	getMessageCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return withSignRegex("ig .*");
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return !!message.key.fromMe;
	}

	protected download = async (link: string) => {
		const resp = await fetch(
			"https://mediasaver.binsarjr.com/services/igdownloader?url=" + link
		);
		const json: {
			success: boolean;
			data: { thumb: string; url: string; is_video: boolean }[];
		} = await resp.json();
		return json;
	};

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const text = getMessageCaption(message.message!);

		const urls: URL[] = [];
		text.split(/\s+/).map((url) => {
			try {
				urls.push(new URL(url));
			} catch (error) {}
		});
		const jid = message.key.remoteJid!;

		if (urls.length === 0) {
			QueueMessage.add(async () => {
				sendWithTyping(
					socket,
					{ text: "Please provide a valid Instagram URL" },
					jid,
					{ quoted: message }
				);
				this.reactToInvalid(socket, message);
			});
			return;
		}

		await Promise.all(
			urls.map(async (url) => {
				const { success, data } = await this.download(url.toString());
				if (success) {
					for (const { thumb, url, is_video } of data) {
						if (is_video) {
							await socket.sendMessage(
								jid,
								{
									video: {
										url,
									},
								},
								{ quoted: message }
							);
						} else {
							await socket.sendMessage(
								jid,
								{
									image: {
										url,
									},
								},
								{ quoted: message }
							);
						}
					}
				}
			})
		);
		this.reactToDone(socket, message);
	}
}
