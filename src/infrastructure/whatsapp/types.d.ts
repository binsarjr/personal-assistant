import type makeWASocket from "@whiskeysockets/baileys";
import type {
	AnyMessageContent,
	MiscMessageGenerationOptions,
	WAProto,
} from "@whiskeysockets/baileys";

export type SocketClient = ReturnType<typeof makeWASocket> & {
	/**
	 * Reply to a message
	 *
	 */
	reply: (
		content: AnyMessageContent,
		options?: MiscMessageGenerationOptions
	) => Promise<WAProto.WebMessageInfo | undefined>;

	/**
	 * Reply to a message with a quoted message
	 */
	replyQuote: (
		content: AnyMessageContent,
		options?: MiscMessageGenerationOptions
	) => Promise<WAProto.WebMessageInfo | undefined>;
	replyQuoteInPrivate: (
		content: AnyMessageContent,
		options?: MiscMessageGenerationOptions
	) => Promise<WAProto.WebMessageInfo | undefined>;

	react: (emoji: string) => Promise<WAProto.WebMessageInfo | undefined>;
	reactToProcessing: () => Promise<WAProto.WebMessageInfo | undefined>;
	resetReact: () => Promise<WAProto.WebMessageInfo | undefined>;
	reactToDone: () => Promise<WAProto.WebMessageInfo | undefined>;
	reactToFailed: () => Promise<WAProto.WebMessageInfo | undefined>;
	reactToInvalid: () => Promise<WAProto.WebMessageInfo | undefined>;
};
