import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { nlpProcess } from '../../nlp/nlpProcess'
import { getMessageCaption, sendMessageWTyping } from '../../utils'

export class BalasanTerimaKasih extends MessageUpsert {
  chat: 'all' | 'group' | 'user' = 'user'
  async handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    const message = getMessageCaption(props.message.message!)
    const jid = props.message.key.remoteJid || ''
    const {
      answer,
      score,
      intent,
    }: {
      answer: string
      score: number
      intent: 'ungkapan.terima-kasih'
    } = await nlpProcess(message)
    if (score > 0.9 && intent == 'ungkapan.terima-kasih') {
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
}
