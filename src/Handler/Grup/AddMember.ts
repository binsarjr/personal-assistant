import {
  MessageUpsertType,
  getContentType,
  isJidUser,
  proto,
} from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { getMessageCaption, getMessageQutoedCaption } from '../../utils'

export class AddMember extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = ['/add', /\/add .*/i,
  new RegExp('touch .*','i'),
]
  fromMe: boolean = true
  groupAccess: 'all' | 'admin' | 'member' = 'admin'
  chat: 'all' | 'group' | 'user' = 'group'
  async handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>) {
    const jid = props.message.key.remoteJid || ''

    const text = getMessageCaption(props.message.message!)
    const quotedText = getMessageQutoedCaption(props.message.message!)
    const raw = text + ' ' + quotedText

    let participants: string[] = []
    // mentioned jid
    const message = props.message.message!
    const type = getContentType(message)!
    const msg =
      type == 'viewOnceMessage'
        ? message[type]!.message![getContentType(message[type]!.message!)!]
        : message[type]

    let mentions =
      message.extendedTextMessage?.contextInfo?.quotedMessage
        ?.extendedTextMessage?.contextInfo?.mentionedJid ||
      (msg as proto.Message.IVideoMessage).contextInfo?.mentionedJid ||
      (msg as proto.IMessage).extendedTextMessage?.contextInfo?.quotedMessage
        ?.extendedTextMessage?.contextInfo?.mentionedJid ||
      []
    mentions = mentions.filter(Boolean)
    participants = [...participants, ...mentions]

    // cek apabila ternyata add nya ad spasi dan kemungkinan add by nomor
    raw.split(/\s+/).map((w) => {
      if (!w.includes('@') && /^\d+$/.test(w)) w += '@s.whatsapp.net'
      if (isJidUser(w)) participants.push(w)
    })

    const quotedMessage =
      props.message.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const contacts =
      quotedMessage?.contactsArrayMessage?.contacts || [
        quotedMessage?.contactMessage,
      ] ||
      []
    if (contacts.length) {
      contacts.filter(Boolean).map((contact) => {
        const vcard = contact?.vcard || ''
        let jid = /waid=(\d+)/i.exec(vcard)![1] || ''
        jid += '@s.whatsapp.net'
        if (isJidUser(jid)) participants.push(jid)
      })
    }

    try {
      await Queue(() =>
        socket.groupParticipantsUpdate(jid, participants, 'add'),
      )
    } catch (error) {
      console.log('Bukan admin add member')
    }
  }
}
