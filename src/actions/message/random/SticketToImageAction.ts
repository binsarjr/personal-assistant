import { WAMessage, type WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { withSign } from "../../../supports/flag.js";
import {
	downloadContentBufferFromMessage,
	getJid,
} from "../../../supports/message.js";

export default class extends BaseMessageHandlerAction {
	patterns() {
		return [withSign("toimg")];
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);

		let photoBuffer: Buffer | null = null;

		switch (true) {
			case Boolean(
				message.message?.extendedTextMessage?.contextInfo?.quotedMessage
					?.stickerMessage
			):
				{
					const directPath =
						message.message?.extendedTextMessage?.contextInfo?.quotedMessage
							?.stickerMessage?.directPath;
					const mediaKey =
						message.message?.extendedTextMessage?.contextInfo?.quotedMessage
							?.stickerMessage?.mediaKey;
					const url =
						message.message?.extendedTextMessage?.contextInfo?.quotedMessage
							?.stickerMessage?.url;
					photoBuffer = await downloadContentBufferFromMessage(
						{
							directPath,
							mediaKey,
							url,
						},
						"image"
					);
				}
				break;
			case Boolean(message?.message?.stickerMessage):
				{
					const directPath = message?.message?.stickerMessage?.directPath;
					const mediaKey = message?.message?.stickerMessage?.mediaKey;
					const url = message?.message?.stickerMessage?.url;
					photoBuffer = await downloadContentBufferFromMessage(
						{
							directPath,
							mediaKey,
							url,
						},
						"image"
					);
				}
				break;
			default:
				this.reactToInvalid(socket, message);
				return;
		}

		if (!photoBuffer) {
			this.reactToInvalid(socket, message);
			return;
		}

		await socket.sendMessage(
			getJid(message),
			{
				image: photoBuffer,
			},
			{
				quoted: message,
			}
		);
		await this.reactToDone(socket, message);
	}
}
