import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../Contracts/IEventListener'
import { MessageUpsert } from '../Facades/Events/Message/MessageUpsert'
import Queue from '../Facades/Queue'
import { sendMessageWTyping } from '../utils'

export class Ping extends MessageUpsert {
  fromMe: boolean = true
  onlyMe: boolean = true
  patterns: string | false | RegExp | (string | RegExp)[] = ['/ping']
  handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = props.message.key.remoteJid || ''
    Queue(() =>
      sendMessageWTyping(
        {
          text: 'pong',
        },
        jid,
        socket,
        {
          quoted: props.message,
        },
      ),
    )
  }
}
