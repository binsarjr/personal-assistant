import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import NotEligableToProcess from "../../../errors/NotEligableToProcess.js";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import DB from "../../../services/database.js";
import { QueueMessage } from "../../../services/queue.js";
import { withSign, withSignRegex } from "../../../supports/flag.js";
import {
	getJid,
	getMessageCaption,
	sendWithTyping,
} from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return [withSign("gemini"), withSignRegex("gemini start|stop")];
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		this.resolveGeminiStartStopWithoutRegister(socket, message);
		return !!message.key.fromMe;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);
		const jid = getJid(message);
		const caption = getMessageCaption(message.message!)
			.toLowerCase()
			.replace(new RegExp(`^${process.env.COMMAND_SIGN}`), "")
			.trim();

		if (caption == "gemini")
			this.resolveRegisterGeminiChat(socket, message, jid);
		else if (caption == "gemini start")
			this.resolveGeminiStart(socket, message, jid);
		else if (caption == "gemini stop")
			this.resolveGeminiStop(socket, message, jid);
		else {
			await this.reactToInvalid(socket, message);
			socket.sendMessage(
				jid,
				{ text: "something wrong,caption:" + caption },
				{ quoted: message }
			);
		}

		await DB.write();
	}

	protected resolveGeminiStartStopWithoutRegister(
		socket: WASocket,
		message: WAMessage
	) {
		const caption = getMessageCaption(message.message!)
			.replace(process.env.COMMAND_SIGN + "gemini ", "")
			.trim();
		if (caption == "start" || caption == "stop") {
			if (DB.data.gemini[getJid(message)] === undefined) {
				throw new NotEligableToProcess();
			}
		}
	}
	protected resolveGeminiStart(
		socket: WASocket,
		message: WAMessage,
		jid: string
	) {
		DB.data.gemini[process.env.BOT_NAME!][`${jid}`].active = true;
		QueueMessage.add(async () => {
			await sendWithTyping(
				socket,
				{
					text: `gemini sudah diaktifkan di chat ini.`,
				},
				jid,
				{ quoted: message }
			);
			await this.reactToDone(socket, message);
		});
	}

	protected resolveGeminiStop(
		socket: WASocket,
		message: WAMessage,
		jid: string
	) {
		DB.data.gemini[process.env.BOT_NAME!][`${jid}`].active = false;
		QueueMessage.add(async () => {
			await sendWithTyping(
				socket,
				{
					text: `gemini sudah dimatikan di chat ini.`,
				},
				jid,
				{ quoted: message }
			);
			await this.reactToDone(socket, message);
		});
	}

	protected resolveRegisterGeminiChat(
		socket: WASocket,
		message: WAMessage,
		jid: string
	) {
		if (DB.data.gemini[process.env.BOT_NAME!] === undefined)
			DB.data.gemini[process.env.BOT_NAME!] = {};
		if (DB.data.gemini[process.env.BOT_NAME!][`${jid}`] === undefined) {
			DB.data.gemini[process.env.BOT_NAME!][jid] = {
				active: false,
				rules: [],
			};
		}

		QueueMessage.add(async () => {
			await sendWithTyping(
				socket,
				{
					text: `
Chat ini sudah dijadikan chat gemini.
gunakan perintah:
1. *.setrule {rule}* untuk mensetting rule.
2. *.rules* untuk melihat rule yang sudah di set.

          `.trim(),
				},
				jid,
				{ quoted: message }
			);
			await this.reactToDone(socket, message);
		});
	}
}
