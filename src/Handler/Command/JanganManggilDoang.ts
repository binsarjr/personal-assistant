import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { ChatType } from '../../Contracts/ChatType'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsertWithNlp } from '../../Facades/Events/Message/MessageUpsertWithNlp'
import Queue from '../../Facades/Queue'
import { sendMessageWTyping } from '../../utils'

export class JanganManggilDoang extends MessageUpsertWithNlp {
  expectIntent: string = 'manggildoang'
  expectMinScore: number = 1
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

    Queue(() =>
      sendMessageWTyping(
        {
          text: this.data.answer,
        },
        jid,
        socket,
        { quoted: props.message },
      ),
    )
  }
}
