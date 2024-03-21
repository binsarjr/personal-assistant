import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import FormData from "form-data";
import got, { RequestError } from "got";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { Queue } from "../../../services/queue.js";
import { withSign } from "../../../supports/flag.js";
import {
	downloadContentBufferFromMessage,
	getJid,
	getMessageFromViewOnce,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return [withSign("hd")];
	}

	async process(socket: WASocket, _message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, _message);

		const message = getMessageFromViewOnce(_message);

		let mediaKey: Uint8Array | null | undefined;
		let directPath: string | null | undefined;
		let url: string | null | undefined;

		let photoBuffer: Buffer;

		if (
			message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
		) {
			mediaKey =
				message!.extendedTextMessage!.contextInfo!.quotedMessage!.imageMessage!
					.mediaKey;
			directPath =
				message!.extendedTextMessage!.contextInfo!.quotedMessage!.imageMessage!
					.directPath;
			url =
				message!.extendedTextMessage!.contextInfo!.quotedMessage!.imageMessage!
					.url;
		} else if (message?.imageMessage) {
			mediaKey = message!.imageMessage!.mediaKey;
			directPath = message!.imageMessage!.directPath;
			url = message!.imageMessage!.url;
		} else {
			this.resetReact(socket, _message);
			return;
		}

		photoBuffer = await downloadContentBufferFromMessage(
			{ directPath, mediaKey, url },
			"image"
		);

		const data = new FormData();
		data.append("image", photoBuffer, "image.jpg");
		data.append("scale", "4");

		try {
			const result = await got
				.post("https://api2.pixelcut.app/image/upscale/v1", {
					body: data,
					headers: {
						accept: "application/json",
						"user-agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36" +
							Date.now(),
					},
				})
				.json<{ result_url: string }>();

			Queue.add(async () => {
				if (!result.result_url) {
					this.reactToFailed(socket, _message);

					return;
				}

				await socket.sendMessage(
					getJid(_message),
					{
						image: {
							url: result.result_url,
						},
					},
					{ quoted: _message }
				);
				await this.reactToDone(socket, _message);
			});
		} catch (err) {
			if (err instanceof RequestError) {
				const { error, error_code } = JSON.parse(err.response!.body) as {
					error: string;
					error_code: string;
				};
				await socket.sendMessage(
					getJid(_message),
					{
						text: `Error Code ${error_code}: ${error}`,
					},
					{ quoted: _message }
				);
				await this.reactToFailed(socket, _message);

				return;
			}
			throw err;
		}
	}
}
