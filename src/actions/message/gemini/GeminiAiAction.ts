import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSign, withSignRegex } from "../../../supports/flag.js";
import {
	getJid,
	getMessageCaption,
	getMessageQutoedCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return [withSignRegex("ai .*"), withSign("ai")];
	}

	getKey() {
		const keys = (process.env.GEMINI_API_KEY || "").split(",");
		return keys[Math.floor(Math.random() * keys.length)];
	}
	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const jid = getJid(message);
		let caption = getMessageCaption(message.message!)
			.replace(new RegExp(`^${process.env.COMMAND_SIGN}ai`), "")
			.trim();
		const quoted = getMessageQutoedCaption(message.message!);
		if (quoted) {
			caption += "\n\n\n\n\n" + quoted;
		}
		if (caption?.length > 1) {
			const key = this.getKey();
			const genAI = new GoogleGenerativeAI(key);
			const model = genAI.getGenerativeModel({
				model: "gemini-pro",
				generationConfig: {
					temperature: 1,
				},
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

			const response = await model.generateContent(caption);

			const text = response.response.text();

			QueueMessage.add(async () => {
				await sendWithTyping(
					socket,
					{
						text: text,
					},
					jid,
					{ quoted: message }
				);
				this.reactToDone(socket, message);
			});
		}
	}
}
