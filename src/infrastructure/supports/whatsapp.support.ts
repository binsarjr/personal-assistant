import {
	downloadContentFromMessage,
	getContentType,
	type DownloadableMessage,
	type MediaDownloadOptions,
	type MediaType,
	type MessageType,
	type proto,
} from "@whiskeysockets/baileys";

export const getMessageCaption = (message: proto.IMessage) => {
	if (!message) return "";

	const type = getContentType(message)!;
	const msg =
		type == "viewOnceMessage"
			? message[type]!.message![getContentType(message[type]!.message!)!]
			: message[type];

	return (
		message?.conversation ||
		(msg as proto.Message.IVideoMessage)?.caption ||
		(msg as proto.Message.IExtendedTextMessage)?.text ||
		message.ephemeralMessage?.message?.extendedTextMessage?.text ||
		message.extendedTextMessage?.text ||
		(type == "viewOnceMessage" &&
			(msg as proto.Message.IVideoMessage)?.caption) ||
		""
	);
};

export const getMessageQutoedCaption = (message: proto.IMessage) => {
	const type = getContentType(message)!;
	const msg =
		type == "viewOnceMessage"
			? message[type]!.message![getContentType(message[type]!.message!)!]
			: message[type];

	return (
		message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo
			?.quotedMessage?.conversation ||
		message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
		message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
			?.caption ||
		message?.extendedTextMessage?.contextInfo?.quotedMessage
			?.extendedTextMessage?.text ||
		(msg as proto.Message.IVideoMessage)?.contextInfo?.quotedMessage
			?.conversation ||
		(msg as proto.IMessage)?.imageMessage?.caption ||
		""
	);
};

export const whatsappFormat = (text: string) => {
	// replace **text** to *text*
	text = text.replace(/\*\*(.*?)\*\*/g, "*$1*");
	// replace __text__ to _text_
	text = text.replace(/__(.*?)__/g, "_$1_");
	// replace [text](url) to *text* (url)
	text = text.replace(/\[(.*?)\]\((.*?)\)/g, "*$1* ($2)");
	// replace [text] to *text*
	text = text.replace(/\[(.*?)\]/g, "*$1*");
	// remove all headings (#)
	text = text.replace(/^#+/gm, "");
	return text;
};

export const downloadContentBufferFromMessage = async (
	{ mediaKey, directPath, url }: DownloadableMessage,
	type: MediaType,
	opts?: MediaDownloadOptions
): Promise<Buffer> => {
	const stream = await downloadContentFromMessage(
		{ mediaKey, directPath, url },
		type,
		opts
	);
	const bufferArray: Buffer[] = [];
	for await (const chunk of stream) {
		bufferArray.push(chunk);
	}

	return Buffer.concat(bufferArray);
};

export const downloadQuotedMessageMedia = async (
	message: proto.IMessage
): Promise<Buffer> => {
	const type = Object.keys(message)[0] as MessageType;
	const msg = message[type as keyof typeof message];

	const stream = await downloadContentFromMessage(
		msg as DownloadableMessage,
		type.replace("Message", "") as MediaType
	);
	let buffer = Buffer.from([]);
	for await (const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk]);
	}

	return buffer;
};
