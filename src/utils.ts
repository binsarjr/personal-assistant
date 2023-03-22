import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WASocket,
  delay,
  getContentType,
  proto,
} from '@adiwajshing/baileys'
import FuzzySet from 'fuzzyset'
import { join } from 'path'

export const getMessageCaption = (message: proto.IMessage) => {
  const type = getContentType(message)!
  const msg =
    type == 'viewOnceMessage'
      ? message[type]!.message![getContentType(message[type]!.message!)!]
      : message[type]

  return (
    message.conversation ||
    (msg as proto.Message.IVideoMessage).caption ||
    (msg as proto.Message.IExtendedTextMessage).text ||
    message.ephemeralMessage?.message?.extendedTextMessage?.text ||
    message.extendedTextMessage?.text ||
    (type == 'viewOnceMessage' &&
      (msg as proto.Message.IVideoMessage).caption) ||
    ''
  )
}
export const getMessageQutoedCaption = (message: proto.IMessage) => {
  const type = getContentType(message)!
  const msg =
    type == 'viewOnceMessage'
      ? message[type]!.message![getContentType(message[type]!.message!)!]
      : message[type]

  return (
    message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo
      ?.quotedMessage?.conversation ||
    message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
    (msg as proto.Message.IVideoMessage)?.contextInfo?.quotedMessage
      ?.conversation ||
    ''
  )
}
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
    return new RegExp(`^${pattern}$`, 'i').test(subject)
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
  options?: MiscMessageGenerationOptions,
) => {
  await Promise.all([
    sock.presenceSubscribe(jid),
    delay(randomInteger(200, 500)),
  ])

  await Promise.all([
    sock.sendPresenceUpdate('composing', jid),
    delay(randomInteger(500, 1500)),
  ])

  await sock.sendPresenceUpdate('paused', jid)

  const sendedMsg = await sock.sendMessage(jid, msg, options)
  if (sendedMsg) {
    await delay(randomInteger(200, 500))
    await sock.sendMessage(jid, {
      react: {
        text: '🤖',
        key: sendedMsg.key,
      },
    })
  }
  return sendedMsg
}

export const toInCaseSensitive = (text: string) =>
  new RegExp('\\b' + text + '\\b', 'i')

export const rootPath = (path: string) => join(__dirname, '../', path)

export function convertTextToRegex(text: string, threshold = 0.9) {
  // Memisahkan kata dalam teks menjadi array
  const words = text.split(' ')

  // Membangun fuzzy set dari array kata
  const fuzzySet = FuzzySet(words)

  // Mencari kata yang cocok dengan setiap kata dalam teks
  const regexWords = words.map((word) => {
    const matches = fuzzySet.get(word, threshold)
    // @ts-ignore
    if (matches && matches?.length > 0) {
      // Mengambil kata dengan skor tertinggi
      // @ts-ignore
      const match = matches[0][1]
      // Mengubah kata menjadi pola regex
      return `(${match})`
    }
    // Jika tidak ada kata yang cocok, mengembalikan kata asli
    return word
  })

  // Menggabungkan kata-kata menjadi pola regex
  const regex = regexWords.join('\\s+')

  return new RegExp(regex, 'gi')
}
