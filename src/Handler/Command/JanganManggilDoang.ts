import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { ChatType } from '../../Contracts/ChatType'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { nlpProcess } from '../../nlp/nlpProcess'
import { getMessageCaption, sendMessageWTyping } from '../../utils'

export class JanganManggilDoang extends MessageUpsert {
  chat: ChatType = 'mention'
  // patterns: string | false | RegExp | (string | RegExp)[] = [
  //   new RegExp('^[s]+[a]+[r]+$', 'i'),
  //   new RegExp('^[b]+[i]+[n]+$', 'i'),
  //   new RegExp('^[b]+[i]+[n]+[s]+[a]+[r]+$', 'i'),
  //   new RegExp('^mas\\s+[b]+[i]+[n]+$', 'i'),
  //   new RegExp('^mas\\s+[b]+[i]+[n]+[s]+[a]+[r]+$', 'i'),
  //   new RegExp('^(mas|ngab|bro)$', 'i'),
  //   new RegExp('^pak\\s+[b]+[i]+[n]+$', 'i'),
  //   new RegExp('^p$', 'i'),
  // ]
  async handler({
    props,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    const jid = props.message.key.remoteJid || ''
    const message = getMessageCaption(props.message.message!)
    const response = await nlpProcess(message)
    const {
      answer,
      score,
      intent,
    }: {
      answer: string
      score: number
      intent: 'manggildoang'
    } = response

    if (score == 1 && intent == 'manggildoang') {
      Queue(() =>
        sendMessageWTyping(
          {
            text: answer,
          },
          jid,
          socket,
          { quoted: props.message },
        ),
      )
    }
  }
}
