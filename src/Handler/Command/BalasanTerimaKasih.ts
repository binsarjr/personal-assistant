import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import UcapanTerimaKasihClassifier from '../../NLP_Area/Sentimen/UcapanTerimaKasihClassifier'
import { getMessageCaption } from '../../utils'

export class BalasanTerimaKasih extends MessageUpsert {
  chat: 'all' | 'group' | 'user' = 'user'
  handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const message = getMessageCaption(props.message.message!)
    const classify = UcapanTerimaKasihClassifier.classifier.classify(message)
    
    if (classify) {
      const jid = props.message.key.remoteJid || ''
      Queue(() =>
        socket.sendMessage(jid, {
          react: {
            text: '👌',
            key: props.message.key,
          },
        }),
      )
    }
  }
}
