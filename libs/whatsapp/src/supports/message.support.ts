import {
  delay,
  downloadContentFromMessage,
  getContentType,
  type AnyMessageContent,
  type DownloadableMessage,
  type MediaDownloadOptions,
  type MediaType,
  type MessageType,
  type MiscMessageGenerationOptions,
  type WAMessage,
  type WASocket,
  type proto,
} from '@whiskeysockets/baileys';
import { randomInteger } from 'src/supports/number.support';

export const getJid = (message: WAMessage): string => {
  return message.key.remoteJid ?? '';
};

export const react = async (
  socket: WASocket,
  emoji: string,
  message: WAMessage | proto.IWebMessageInfo,
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
  message: WAMessage,
): proto.IMessage | null | undefined => {
  return (
    message.message?.viewOnceMessage?.message ||
    message.message?.viewOnceMessageV2?.message ||
    message.message?.viewOnceMessageV2Extension?.message ||
    message.message
  );
};

export const getContextInfo = (
  _message: WAMessage,
): proto.IContextInfo | null => {
  const message = getMessageFromViewOnce(_message);

  return (
    message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo ||
    message?.extendedTextMessage?.contextInfo ||
    null
  );
};

export const getMessageCaption = (message: proto.IMessage) => {
  if (!message) return '';

  const type = getContentType(message)!;
  const msg =
    type == 'viewOnceMessage'
      ? message[type]!.message![getContentType(message[type]!.message!)!]
      : message[type];

  return (
    message?.conversation ||
    (msg as proto.Message.IVideoMessage)?.caption ||
    (msg as proto.Message.IExtendedTextMessage)?.text ||
    message.ephemeralMessage?.message?.extendedTextMessage?.text ||
    message.extendedTextMessage?.text ||
    (type == 'viewOnceMessage' &&
      (msg as proto.Message.IVideoMessage)?.caption) ||
    ''
  );
};

export const getMessageQutoedCaption = (message: proto.IMessage) => {
  const type = getContentType(message)!;
  const msg =
    type == 'viewOnceMessage'
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
    ''
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
  options?: MiscMessageGenerationOptions,
) => {
  await Promise.all([
    socket.presenceSubscribe(jid),
    // delay(randomInteger(200, 500)),
  ]);

  // await Promise.all([
  // 	socket.sendPresenceUpdate("composing", jid),
  // 	delay(randomInteger(500, 1500)),
  // ]);

  // await socket.sendPresenceUpdate("paused", jid);

  const sendedMsg = await socket.sendMessage(jid, message, options);
  // if (sendedMsg) {
  // 	await delay(randomInteger(10, 200));
  // 	await react(socket, "🤖", sendedMsg);
  // }
  return sendedMsg;
};

export const downloadContentBufferFromMessage = async (
  { mediaKey, directPath, url }: DownloadableMessage,
  type: MediaType,
  opts?: MediaDownloadOptions,
): Promise<Buffer> => {
  const stream = await downloadContentFromMessage(
    { mediaKey, directPath, url },
    type,
    opts,
  );
  const bufferArray: Buffer[] = [];
  for await (const chunk of stream) {
    bufferArray.push(chunk);
  }

  return Buffer.concat(bufferArray);
};

export const downloadQuotedMessageMedia = async (
  message: proto.IMessage,
): Promise<Buffer> => {
  const type = Object.keys(message)[0] as MessageType;
  const msg = message[type as keyof typeof message];

  const stream = await downloadContentFromMessage(
    msg as DownloadableMessage,
    type.replace('Message', '') as MediaType,
  );
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  return buffer;
};
