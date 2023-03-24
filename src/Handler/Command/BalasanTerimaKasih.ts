import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsertWithNlp } from '../../Facades/Events/Message/MessageUpsertWithNlp'
import Queue from '../../Facades/Queue'
import { sendMessageWTyping } from '../../utils'

export class BalasanTerimaKasih extends MessageUpsertWithNlp {
  expectIntent: string = 'ungkapan.terima-kasih'
  expectMinScore: number = 0.9
  chat: 'all' | 'group' | 'user' = 'user'
  async handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    const jid = props.message.key.remoteJid || ''
    Queue(() =>
      sendMessageWTyping(
        {
          text: this.data.answer,
        },
        jid,
        socket,
        { quoted: props.message! },
      ),
    )
  }
}
