import {
	delay,
	getContentType,
	type AnyMessageContent,
	type MiscMessageGenerationOptions,
	type WAMessage,
	type WASocket,
	type proto,
} from "@whiskeysockets/baileys";
import { randomInteger } from "./number.js";

export const getJid = (message: WAMessage): string => {
	return message.key.remoteJid ?? "";
};

export const react = async (
	socket: WASocket,
	emoji: string,
	message: WAMessage
): Promise<void> => {
	await delay(randomInteger(100, 500));
	socket.sendMessage(getJid(message), {
		react: {
			text: emoji,
			key: message.key,
		},
	});
};

export const getMessageFromViewOnce = (
	message: WAMessage
): proto.IMessage | null | undefined => {
	return (
		message.message?.viewOnceMessage?.message ||
		message.message?.viewOnceMessageV2?.message ||
		message.message?.viewOnceMessageV2Extension?.message ||
		message.message
	);
};

export const getContextInfo = (
	_message: WAMessage
): proto.IContextInfo | null => {
	const message = getMessageFromViewOnce(_message);

	return (
		message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo ||
		message?.extendedTextMessage?.contextInfo ||
		null
	);
};

export const getMessageCaption = (message: proto.IMessage) => {
	if (!message) return "";

	const type = getContentType(message)!;
	const msg =
		type == "viewOnceMessage"
			? message[type]!.message![getContentType(message[type]!.message!)!]
			: message[type];

	return (
		message.conversation ||
		(msg as proto.Message.IVideoMessage).caption ||
		(msg as proto.Message.IExtendedTextMessage).text ||
		message.ephemeralMessage?.message?.extendedTextMessage?.text ||
		message.extendedTextMessage?.text ||
		(type == "viewOnceMessage" &&
			(msg as proto.Message.IVideoMessage).caption) ||
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
		message?.extendedTextMessage?.contextInfo?.quotedMessage
			?.extendedTextMessage?.text ||
		(msg as proto.Message.IVideoMessage)?.contextInfo?.quotedMessage
			?.conversation ||
		""
	);
};

/**
 * Mengirim pesan dengan simulasi mengetik.
 * Fungsi ini akan mengirim pesan yang diberikan dengan simulasi mengetik, jadi
 * akan menampilkan bahwa seseorang sedang mengetik.
 *
 * @param msg - Pesan yang akan dikirim.
 * @param jid - JID tujuan pesan.
 * @param socket - Instance dari WASocket.
 */
export const sendWithTyping = async (
	socket: WASocket,
	message: AnyMessageContent,
	jid: string,
	options?: MiscMessageGenerationOptions
) => {
	await Promise.all([
		socket.presenceSubscribe(jid),
		delay(randomInteger(200, 500)),
	]);

	await Promise.all([
		socket.sendPresenceUpdate("composing", jid),
		delay(randomInteger(500, 1500)),
	]);

	await socket.sendPresenceUpdate("paused", jid);

	const sendedMsg = await socket.sendMessage(jid, message, options);
	// if (sendedMsg) {
	// 	await delay(randomInteger(10, 200));
	// 	await react(socket, "🤖", sendedMsg);
	// }
	return sendedMsg;
};
