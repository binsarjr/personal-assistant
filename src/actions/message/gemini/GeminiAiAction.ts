import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import {
	downloadMediaMessage,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import GeminiMessageHandlerAction from "../../../foundation/actions/GeminiMessageHandlerAction.js";
import DB from "../../../services/database.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSign, withSignRegex } from "../../../supports/flag.js";
import {
	downloadContentBufferFromMessage,
	getJid,
	getMessageCaption,
	getMessageFromViewOnce,
	getMessageQutoedCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends GeminiMessageHandlerAction {
	commandSign = "ai";
	patterns(): MessagePattern {
		return [
			withSignRegex(this.commandSign + " .*"),
			withSign(this.commandSign),
		];
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const jid = getJid(message);
		let caption = getMessageCaption(message.message!)
			.replace(new RegExp(`^${process.env.COMMAND_SIGN}ai`), "")
			.trim();

		const viewOnce = getMessageFromViewOnce(message);
		const image = viewOnce?.imageMessage || message?.message?.imageMessage;
		const anyImage = !!image;

		const quoted = getMessageQutoedCaption(message.message!);

		const prompts: any[] = [];
		prompts.push(caption.trim());

		if (anyImage) {
			const media = (await downloadMediaMessage(
				message,
				"buffer",
				{}
			)) as Buffer;
			prompts.push({
				inlineData: {
					data: Buffer.from(media).toString("base64"),
					mimeType: "image/jpeg",
				},
			});
		}

		if (quoted) {
			prompts.push("\n\n\n\n\n");
			prompts.push(quoted);
		}

		const quotedMessage =
			viewOnce?.extendedTextMessage?.contextInfo?.quotedMessage;
		if (quotedMessage?.imageMessage) {
			const media = await downloadContentBufferFromMessage(
				{
					directPath: quotedMessage.imageMessage.directPath,
					mediaKey: quotedMessage.imageMessage.mediaKey,
					url: quotedMessage.imageMessage.url,
				},
				"image"
			);
			prompts.push({
				inlineData: {
					data: Buffer.from(media).toString("base64"),
					mimeType: "image/jpeg",
				},
			});
		}

		const hasImage = anyImage || quotedMessage?.imageMessage;

		const key = this.getKey();
		const genAI = new GoogleGenerativeAI(key);
		const model = genAI.getGenerativeModel({
			model: hasImage ? "gemini-pro-vision" : "gemini-pro",

			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
			],
		});

		const response = await model.generateContent(prompts);

		const text = response.response.text().trim();

		QueueMessage.add(async () => {
			const sendedMessage = await sendWithTyping(
				socket,
				{
					text: text,
				},
				jid,
				{ quoted: message }
			);
			this.saveGeminiKey(sendedMessage?.key?.id || "");
			this.reactToDone(socket, message);
		});
	}

	saveGeminiKey(key: string) {
		!DB.data.geminiMessageResponseIds &&
			(DB.data.geminiMessageResponseIds = {});
		DB.data.geminiMessageResponseIds[key] = Date.now();
	}
}
