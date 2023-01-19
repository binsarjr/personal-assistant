import { AnyMessageContent, WASocket, delay, proto } from '@adiwajshing/baileys'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

export const getMessageCaption = (message: proto.IMessage) =>
  message.conversation ||
  message.ephemeralMessage?.message?.extendedTextMessage?.text ||
  message.extendedTextMessage?.text ||
  ''

/**
 * Memvalidasi apakah pola atau subjek cocok.
 * Fungsi ini menggunakan ekspresi reguler atau pencocokan string standar untuk
 * memvalidasi pola atau subjek.
 *
 * @param pattern - Pola yang akan divalidasi. Bisa berupa ekspresi reguler atau
 * string standar.
 * @param subject - Subjek yang akan divalidasi.
 * @returns true jika pola atau subjek cocok, false jika tidak.
 */
export const validatePattern = (pattern: string | RegExp, subject: string) => {
  if (pattern instanceof RegExp) {
    return pattern.test(subject)
  } else {
    return pattern == subject
  }
}

/**
 * Mengembalikan angka integer yang merupakan hasil dari pembulatan nilai acak
 * dalam rentang min sampai max.
 *
 * @param min - nilai minimal yang disediakan.
 * @param max - nilai maksimal yang disediakan.
 * @returns sebuah bilangan integer hasil pembulatan nilai acak dalam rentang
 * min sampai max.
 */
export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Mengirim pesan dengan simulasi mengetik.
 * Fungsi ini akan mengirim pesan yang diberikan dengan simulasi mengetik, jadi
 * akan menampilkan bahwa seseorang sedang mengetik.
 *
 * @param msg - Pesan yang akan dikirim.
 * @param jid - JID tujuan pesan.
 * @param sock - Instance dari WASocket.
 */
export const sendMessageWTyping = async (
  msg: AnyMessageContent,
  jid: string,
  sock: WASocket,
) => {
  await sock.presenceSubscribe(jid)
  await delay(randomInteger(200, 500))

  await sock.sendPresenceUpdate('composing', jid)
  await delay(randomInteger(1000, 2000))

  await sock.sendPresenceUpdate('paused', jid)

  await sock.sendMessage(jid, msg)
}

export const toInCaseSensitive = (text: string) =>
  new RegExp('\\b' + text + '\\b', 'i')

export const dataStorePath = path.join(__dirname, '../../.data_store')
export const checkStore = () => {
  !existsSync(dataStorePath) && mkdirSync(dataStorePath, { recursive: true })
}
