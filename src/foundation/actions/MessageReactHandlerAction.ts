import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import Emoji from "../../enums/Emoji.js";
import { QueueMessage } from "../../services/queue.js";
import { react } from "../../supports/message.js";

export default abstract class {
	protected async reactToProcessing(socket: WASocket, message: WAMessage) {
		return QueueMessage.add(() => react(socket, Emoji.Processing, message));
	}

	protected resetReact(socket: WASocket, message: WAMessage) {
		return QueueMessage.add(() => react(socket, "", message));
	}

	protected reactToDone(socket: WASocket, message: WAMessage) {
		return QueueMessage.add(() => react(socket, Emoji.Done, message));
	}

	protected reactToFailed(socket: WASocket, message: WAMessage) {
		return QueueMessage.add(() => react(socket, Emoji.Failed, message));
	}

	protected reactToInvalid(socket: WASocket, message: WAMessage) {
		return QueueMessage.add(() => react(socket, Emoji.Invalid, message));
	}
}
