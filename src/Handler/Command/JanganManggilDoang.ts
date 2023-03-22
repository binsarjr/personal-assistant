import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { ChatType } from '../../Contracts/ChatType'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { sendMessageWTyping } from '../../utils'

export class JanganManggilDoang extends MessageUpsert {
  chat: ChatType = 'mention'
  patterns: string | false | RegExp | (string | RegExp)[] = [
    new RegExp('^[s]+[a]+[r]+$', 'i'),
    new RegExp('^[b]+[i]+[n]+$', 'i'),
    new RegExp('^[b]+[i]+[n]+[s]+[a]+[r]+$', 'i'),
    new RegExp('^mas\\s+[b]+[i]+[n]+$', 'i'),
    new RegExp('^mas\\s+[b]+[i]+[n]+[s]+[a]+[r]+$', 'i'),
    new RegExp('^(mas|ngab|bro)$', 'i'),
    new RegExp('^pak\\s+[b]+[i]+[n]+$', 'i'),
    new RegExp('^p$', 'i'),
  ]
  handler({
    props,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = props.message.key.remoteJid || ''
    const message = props.message
    Queue(() =>
      sendMessageWTyping(
        {
          text:
            'Maaf, saat ini Binsar sedang tidak dapat dihubungi. Silakan tuliskan permintaan Anda dan akan kami sampaikan kepada Binsar untuk ditindaklanjuti setelah dia kembali online.',
        },
        jid,
        socket,
        { quoted: message },
      ),
    )
  }
}
