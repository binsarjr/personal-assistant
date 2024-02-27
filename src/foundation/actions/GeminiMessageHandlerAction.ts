import {
	jidNormalizedUser,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import NotEligableToProcess from "../../errors/NotEligableToProcess.js";
import logger from "../../services/logger.js";
import { Queue, QueueMessage } from "../../services/queue.js";
import { patternsAndTextIsMatch } from "../../supports/flag.js";
import { getMessageCaption, sendWithTyping } from "../../supports/message.js";
import BaseMessageHandlerAction from "./BaseMessageHandlerAction.js";

export default abstract class extends BaseMessageHandlerAction {
	getKey() {
		const keys = (process.env.GEMINI_API_KEY || "").split(",");
		return keys[Math.floor(Math.random() * keys.length)];
	}

	public async execute(socket: WASocket, message: WAMessage): Promise<void> {
		try {
			if (
				!patternsAndTextIsMatch(
					this.patterns(),
					getMessageCaption(message.message!)
				)
			) {
				return;
			}
			if (!(await this.isEligibleToProcess(socket, message))) {
				return;
			}
			await this.process(socket, message);
		} catch (err: any) {
			if (err instanceof NotEligableToProcess) return;
			if (
				err
					.toString()
					.includes("The model is overloaded. Please try again later.")
			) {
				Queue.add(() => this.execute(socket, message));
				return;
			}

			this.reactToFailed(socket, message);
			logger.error(err);
			QueueMessage.add(() =>
				sendWithTyping(
					socket,
					{ text: err.message },
					jidNormalizedUser(socket.user?.id!),
					{
						quoted: message,
					}
				)
			);
		}
	}
}
