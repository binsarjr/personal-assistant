import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'

export class BalasanTerimaKasih extends MessageUpsert {
  chat: 'all' | 'group' | 'user' = 'user'
  patterns: string | false | RegExp | (string | RegExp)[] = [
    /ma?ka?si?h/i,
    /thanks/i,
    /thank you/i,
    /thank u/i,
    /terima kasih/i,
    'thanks',
    'thank you',
    'thank u',
    'terima kasih',
  ]
  handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = props.message.key.remoteJid || ''
    Queue(() =>
      socket.sendMessage(jid, {
        react: {
          text: '👍',
          key: props.message.key,
        },
      }),
    )
  }
}
