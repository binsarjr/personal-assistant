import { MessageUpsertType, proto } from '@whiskeysockets/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsertWithNlp } from '../../Facades/Events/Message/MessageUpsertWithNlp'
import Queue from '../../Facades/Queue'
import { sendMessageWTyping } from '../../utils'

export class BalasanTerimaKasih extends MessageUpsertWithNlp {
  expectIntent: string = 'thank'
  chat: 'all' | 'group' | 'user' = 'user'
  async handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    const jid = props.message.key.remoteJid || ''

    let answer = ''
    if (this.results.lang_jawa >= 0.9) answer = 'nggih,sami sami'
    else if (this.results.lang_indonesia >= 0.9) answer = 'sama sama'
    else if (this.results.lang_english >= 0.9) answer = 'no problem'

    Queue(() =>
      sendMessageWTyping(
        {
          text: answer,
        },
        jid,
        socket,
        { quoted: props.message! },
      ),
    )
  }
}
