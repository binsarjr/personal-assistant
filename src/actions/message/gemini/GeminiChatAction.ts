import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import DB from "../../../services/database.js";
import { QueueMessage } from "../../../services/queue.js";
import {
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
		const jid = getJid(message);
		return (
			!message.key.fromMe &&
			DB.data.gemini[process.env.BOT_NAME!][jid] !== undefined
		);
	}
	getKey() {
		const keys = (process.env.GEMINI_API_KEY || "").split(",");
		return keys[Math.floor(Math.random() * keys.length)];
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		const jid = getJid(message);
		const caption = getMessageCaption(message.message!);

		if (caption?.length > 1) {
			const key = this.getKey();
			const genAI = new GoogleGenerativeAI(key);
			const model = genAI.getGenerativeModel({
				model: "gemini-pro",
				generationConfig: {
					temperature: 0.4,
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
			});
		}
	}
}
