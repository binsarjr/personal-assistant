import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { setSibuk } from '../../Lib/Kesibukkan'
import { sendMessageWTyping } from '../../utils'

export class LagiFree extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = ['.free']
  onlyMe: boolean = true
  handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    setSibuk('')
    const jid = props.message.key.remoteJid || ''
    Queue(() =>
      sendMessageWTyping(
        {
          text: 'Selamat menikmati waktu luangmu',
        },
        jid,
        socket,
      ),
    )
  }
}
