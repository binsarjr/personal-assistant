import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { withSign } from "../../../supports/flag.js";
import { getJid, sendWithTyping } from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
	patterns(): MessagePattern {
		return withSign("info");
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return !!message.key.fromMe;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
		const ping =
			Date.now() - (+(message.messageTimestamp as number) || Date.now());

		await sendWithTyping(
			socket,
			{ text: `info server. not yet` },
			getJid(message),
			{ quoted: message }
		);
	}
}
