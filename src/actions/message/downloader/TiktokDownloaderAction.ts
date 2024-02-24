import { type WAMessage, type WASocket } from "@whiskeysockets/baileys";
import fetch from "node-fetch";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { Queue } from "../../../services/queue.js";
import { withSignRegex } from "../../../supports/flag.js";
import {
	getMessageCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return withSignRegex("tt .*");
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return !!message.key.fromMe;
	}

	protected download = async (
		link: string
	): Promise<{ video: string; images: string[] }> => {
		const resp = await fetch(
			"https://mediasaver.vercel.app/services/tiktok/snaptik?url=" + link
		);
		const json = (await resp.json()) as { video: string; images: string[] };
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
			Queue.add(async () => {
				sendWithTyping(
					socket,
					{ text: "Please provide a valid Tiktok URL" },
					jid,
					{ quoted: message }
				);
				this.reactToInvalid(socket, message);
			});
			return;
		}

		await Promise.all(
			urls.map(async (url) => {
				const { video, images } = await this.download(url.toString());
				console.log("\n\n\n\n\n\n");

				console.log(video, images);
				console.log("\n\n\n\n\n\n");
				await socket.sendMessage(
					jid,
					{
						video: {
							url: video,
						},
					},
					{ quoted: message }
				);
				for (const image of images) {
					await socket.sendMessage(
						jid,
						{
							image: {
								url: image,
							},
						},
						{ quoted: message }
					);
				}
			})
		);
		this.reactToDone(socket, message);
	}
}
