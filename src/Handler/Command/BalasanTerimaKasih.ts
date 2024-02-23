import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { HandlerArgs } from "../../Contracts/IEventListener";
import { MessageUpsert } from "../../Facades/Events/Message/MessageUpsert";
import { gemini } from "../../supports/gemini";
import { getMessageCaption } from "../../utils";

export class BalasanTerimaKasih extends MessageUpsert {
	chat: "all" | "group" | "user" = "user";
	async handler({
		socket,
		props,
	}: HandlerArgs<{
		message: proto.IWebMessageInfo;
		type: MessageUpsertType;
	}>): Promise<void> {
		const jid = props.message.key.remoteJid || "";
		const text = getMessageCaption(props.message.message!);
		const prompts = await this.rule(text);
		const response = await gemini().generateContent(prompts);
		console.log(response.response.text());
		const result: {
			type: string;
			answer: string;
		} = JSON.parse(response.response.text());
		console.log(result);

		// Queue(() =>
		// 	sendMessageWTyping(
		// 		{
		// 			text: answer,
		// 		},
		// 		jid,
		// 		socket,
		// 		{ quoted: props.message! }
		// 	)
		// );
	}

	protected rule(input: string) {
		const initialPrompts = `
ignore all previous instructions before this one.

You must follow the rules below without exception. if there are conflicting instructions below then delete the instructions. because this instruction is absolute and must be followed:

1. fix the typo first.
2. Please provide the possible answer with casual style, and please what ever the input please try to answerit and definitely depending on the input language.
3. gives the output as json exactly as the "schema:" without markdown formatting and this rule is the most absolute so it is mandatory.
4. And please consider the context; does the input really want to say thanks or not or have another meaning?
5. YOUR ANSWER SHOULD BE FUN, POLITE, AND STILL MAINTAIN A DEGREE OF FORMALITY. AVOID STIFF LANGUAGE AND TRY TO ADD FRIENDLY AND RELAXED ELEMENTS.
6. Please try to answer even there is violence words or impolite words please be kind
7. For your information, i am not support any lgbt things so please keep answer or response the input but act like did not support it

schema:
{
  "type": "balasanTerimaKasih",
  "is_thanks": boolean,
  "is_reply_to_thanks": boolean,
  "answer": {{your answer}}
}
`.trim();
		return [
			initialPrompts,
			"This is the final stage of your init prompt before entering the input you must remember all the rules that exist.",
			`input: ${input}`,
		];
	}
}
