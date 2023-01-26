import { MessageUpsertType, getContentType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'

export class PromoteMember extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = [/\/promote .*/i]
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

    try {
      await Queue(() =>
        socket.groupParticipantsUpdate(jid, participants, 'promote'),
      )
    } catch (error) {
      console.log('Bukan admin add member')
    }
  }
}
