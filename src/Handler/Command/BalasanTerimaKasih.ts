import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'

export class BalasanTerimaKasih extends MessageUpsert {
  chat: 'all' | 'group' | 'user' = 'user'
  patterns: string | false | RegExp | (string | RegExp)[] = [
    /\bma?ka?si?h\b/i,
    /\bthanks\b/i,
    /\bthank you\b/i,
    /\bthank u\b/i,
    /\bterima kasih\b/i,
    new RegExp('\bthanks?\b', 'i'),
    new RegExp('\btha?nk ?y?o?u\b', 'i'),
    new RegExp('\btha?nk ?u\b', 'i'),
    new RegExp('\bte?ri?ma ?ka?si?h\b', 'i'),
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
          text: '👌',
          key: props.message.key,
        },
      }),
    )
  }
}
