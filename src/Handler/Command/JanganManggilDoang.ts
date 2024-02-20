import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { ChatType } from "../../Contracts/ChatType";
import { HandlerArgs } from "../../Contracts/IEventListener";
import { MessageUpsertWithGemini } from "../../Facades/Events/Message/MessageUpsertWithGemini";
import Queue from "../../Facades/Queue";
import { sendMessageWTyping } from "../../utils";

export class JanganManggilDoang extends MessageUpsertWithGemini {
	context: string = "just_call";
	chat: ChatType = "mention";
	// patterns: string | false | RegExp | (string | RegExp)[] = [
	// 	new RegExp("^[s]+[a]+[r]+$", "i"),
	// 	new RegExp("^[b]+[i]+[n]+$", "i"),
	// 	new RegExp("^[b]+[i]+[n]+[s]+[a]+[r]+$", "i"),
	// 	new RegExp("^mas\\s+[b]+[i]+[n]+$", "i"),
	// 	new RegExp("^mas\\s+[b]+[i]+[n]+[s]+[a]+[r]+$", "i"),
	// 	new RegExp("^(mas|ngab|bro)$", "i"),
	// 	new RegExp("^pak\\s+[b]+[i]+[n]+$", "i"),
	// 	new RegExp("^p$", "i"),
	// ];
	async handler({
		props,
		socket,
	}: HandlerArgs<{
		message: proto.IWebMessageInfo;
		type: MessageUpsertType;
	}>): Promise<void> {
		const jid = props.message.key.remoteJid || "";
		console.log(this.result, "jangna manggil");

		Queue(() =>
			sendMessageWTyping(
				{
					text:
						this.result.answer ||
						"Maaf, saat ini Binsar sedang tidak dapat dihubungi. Silakan tuliskan permintaan Anda dan akan kami sampaikan kepada Binsar untuk ditindaklanjuti setelah dia kembali online.",
				},
				jid,
				socket,
				{ quoted: props.message }
			)
		);
	}
}
