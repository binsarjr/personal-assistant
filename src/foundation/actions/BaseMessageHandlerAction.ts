import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import type BaseMessageAction from "../../contracts/actions/BaseMessageAction.js";
import { QueueMessage } from "../../services/queue.js";
import { patternsAndTextIsMatch } from "../../supports/flag.js";
import {
	getJid,
	getMessageCaption,
	sendWithTyping,
} from "../../supports/message.js";
import type { MessagePattern } from "../../types/MessagePattern.js";
import MessageReactHandlerAction from "./MessageReactHandlerAction.js";

export default abstract class
	extends MessageReactHandlerAction
	implements BaseMessageAction
{
	abstract patterns(): MessagePattern;
	public async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return true;
	}

	abstract process(socket: WASocket, message: WAMessage): Promise<void>;
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
		} catch (Error: any) {
			this.reactToFailed(socket, message);
			QueueMessage.add(() =>
				sendWithTyping(socket, { text: Error.message }, getJid(message), {
					quoted: message,
				})
			);
		}
	}
}