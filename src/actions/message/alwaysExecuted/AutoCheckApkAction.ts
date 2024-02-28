import {
	downloadMediaMessage,
	getContentType,
	type WAMessage,
	type WASocket,
	type proto,
} from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import BadanPemeriksaApk from "../../../services/external/BadanPemeriksaApk.js";
import { Queue } from "../../../services/queue.js";
import { getJid, react, sendWithTyping } from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return true;
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		const type = getContentType(message.message!);
		const typeCheck: (keyof proto.IMessage)[] = [
			"documentMessage",
			"documentWithCaptionMessage",
		];
		return typeCheck.includes(type!);
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		const buffer = (await downloadMediaMessage(
			message,
			"buffer",
			{}
		)) as Buffer;
		// @ts-ignore
		const filename =
			// @ts-ignore
			message.message![getContentType(message.message!)!]?.fileName ||
			Date.now() + ".file";
		const bpk = new BadanPemeriksaApk();
		const result = await bpk.upload(buffer, filename);
		if (result?.type == "MENUNGGU DIPROSES") {
			Queue.add(() => setTimeout(() => this.process(socket, message), 5_000));
			return;
		}

		if (result?.type == "VIRUS") {
			Queue.add(async () => {
				await sendWithTyping(
					socket,
					{
						text: "File terdeteksi sebagai virus",
					},
					getJid(message),
					{ quoted: message }
				);
				await react(socket, "🦠", message);
			});
			return;
		}
	}
}
