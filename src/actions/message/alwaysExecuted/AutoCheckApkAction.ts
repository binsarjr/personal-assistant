import {
	downloadMediaMessage,
	getContentType,
	type WAMessage,
	type WASocket,
	type proto,
} from "@whiskeysockets/baileys";
import got from "got";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import BadanPemeriksaApk, {
	type ApkInfo,
} from "../../../services/external/BadanPemeriksaApk.js";
import { Queue } from "../../../services/queue.js";
import { getJid, sendWithTyping } from "../../../supports/message.js";
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
		if (result) this.checkVirus(socket, message, result);
	}

	async checkVirus(
		socket: WASocket,
		message: WAMessage,
		apk: ApkInfo
	): Promise<void> {
		const bpk = new BadanPemeriksaApk();
		const result = await bpk.findByHash(
			apk!.hash,
			await got.get(apk.link!).text()
		);

		if (result?.type == "MENUNGGU DIPROSES") {
			Queue.add(() =>
				setTimeout(() => this.checkVirus(socket, message, result), 5_000)
			);
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
				await socket.chatModify(
					{
						clear: {
							messages: [
								{
									id: message.key.id || "",
									fromMe: true,
									timestamp: +(message.messageTimestamp || ""),
								},
							],
						},
					},
					getJid(message)
				);
			});
			return;
		}
	}
}
