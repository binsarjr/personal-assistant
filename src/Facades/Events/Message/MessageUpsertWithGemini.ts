import { MessageUpsert } from "./MessageUpsert";

export abstract class MessageUpsertWithGemini extends MessageUpsert {
	abstract context: string;
	result: { type: string; answer: string } = { type: "default", answer: "" };
}
