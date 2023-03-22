import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { setSibuk } from '../../Lib/Kesibukkan'
import { getMessageCaption, sendMessageWTyping } from '../../utils'

const regex = /^\.sibuk (.*)/i

export class SetKesibukkan extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = [regex]
  onlyMe: boolean = true
  handler({
    props: upsert,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = upsert.message.key.remoteJid || ''
    const text = getMessageCaption(upsert.message.message!)
    const sibuk = regex.exec(text)![1]
    Queue(() => setSibuk(sibuk))
    Queue(() =>
      sendMessageWTyping(
        {
          text: 'Kesibukkan anda telah disimpan ( *' + sibuk + '* )',
        },
        jid,
        socket,
      ),
    )
  }
}
