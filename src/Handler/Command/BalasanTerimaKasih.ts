import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { HandlerArgs } from "../../Contracts/IEventListener";
import { MessageUpsertWithGemini } from "../../Facades/Events/Message/MessageUpsertWithGemini";
import Queue from "../../Facades/Queue";
import { sendMessageWTyping } from "../../utils";

export class BalasanTerimaKasih extends MessageUpsertWithGemini {
	context: string = "thank";
	chat: "all" | "group" | "user" = "user";
	async handler({
		socket,
		props,
	}: HandlerArgs<{
		message: proto.IWebMessageInfo;
		type: MessageUpsertType;
	}>): Promise<void> {
		const jid = props.message.key.remoteJid || "";

		let answer = this.result.answer;

		Queue(() =>
			sendMessageWTyping(
				{
					text: answer,
				},
				jid,
				socket,
				{ quoted: props.message! }
			)
		);
	}
}
