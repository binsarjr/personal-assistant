import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { sendMessageWTyping } from '../../utils'

export class JanganManggilDoang extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = [
    'mas bin',
    'bin',
    'sar',
    'p',
  ]
  handler({
    props,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = props.message.key.remoteJid || ''
    Queue(() =>
      sendMessageWTyping(
        {
          text:
            'Maaf, saat ini Binsar sedang tidak dapat dihubungi. Silakan tuliskan permintaan Anda dan akan kami sampaikan kepada Binsar untuk ditindaklanjuti setelah dia kembali online.',
        },
        jid,
        socket,
      ),
    )
  }
}