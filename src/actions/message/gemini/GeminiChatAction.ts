import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import DB from "../../../services/database.js";
import { Queue, QueueMessage } from "../../../services/queue.js";
import {
	getJid,
	getMessageCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";
import ClearGeminiHistoryIfNeededAction from "./ClearGeminiHistoryIfNeededAction.js";

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
			DB.data.gemini[process.env.BOT_NAME!][jid] !== undefined &&
			DB.data.gemini[process.env.BOT_NAME!][jid].active
		);
	}
	getKey() {
		const keys = (process.env.GEMINI_API_KEY || "").split(",");
		return keys[Math.floor(Math.random() * keys.length)];
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		await new ClearGeminiHistoryIfNeededAction().execute();

		const jid = getJid(message);
		const caption = getMessageCaption(message.message!);

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

			this.addHistory({ input: caption, jid });

			const response = await model.generateContent(this.prompt(message));

			const text = response.response.text().replaceAll("output:", "").trim();

			QueueMessage.add(async () => {
				await sendWithTyping(
					socket,
					{
						text: text,
					},
					jid,
					{ quoted: message }
				);
				this.addHistory({ output: text, jid });
			});
		}
	}

	protected prompt(message: WAMessage) {
		const jid = getJid(message);
		const rules = DB.data.gemini[process.env.BOT_NAME!][jid].rules || [];

		const prompts = [...rules];

		DB.data.gemini[process.env.BOT_NAME!][jid].history.map((history) => {
			if (history.input) {
				prompts.push(`input: ${history.input}`);
			}
			if (history.output) {
				prompts.push(`output: ${history.output}`);
			}
		});

		return prompts;
	}

	protected addHistory({
		input,
		jid,
		output,
	}: {
		input?: string;
		output?: string;
		jid: string;
	}) {
		if (DB.data.gemini[process.env.BOT_NAME!][jid].history === undefined) {
			DB.data.gemini[process.env.BOT_NAME!][jid].history = [];
		}
		DB.data.gemini[process.env.BOT_NAME!][jid].history.push({
			input,
			output,
			timestamp: Date.now(),
		});
		Queue.add(() => DB.write());
	}
}
