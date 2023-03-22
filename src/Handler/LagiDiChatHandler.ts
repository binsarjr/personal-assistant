import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../Contracts/IEventListener'
import { MessageUpsert } from '../Facades/Events/Message/MessageUpsert'
import Queue from '../Facades/Queue'
import {
  getSibuk,
  hasSudahDikasihTahu,
  setSudahDikasihTahu,
} from '../Lib/Kesibukkan'
import { sendMessageWTyping } from '../utils'

export class LagiDiChatHandler extends MessageUpsert {
  chat: 'all' | 'group' | 'user' = 'user'
  async handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    const jid = props.message.key.remoteJid || ''
    const sibuk = await getSibuk()

    if (!!sibuk && !(await hasSudahDikasihTahu(jid))) {
      setSudahDikasihTahu(jid)
      Queue(() =>
        sendMessageWTyping(
          {
            text: `Maaf, saat ini saya sedang ${sibuk}. Silakan tuliskan keperluan Anda, dan saya akan memeriksanya begitu luang.\n\n_PESAN OTOMATIS_`,
          },
          jid,
          socket,
        ),
      )
    }
  }
}
