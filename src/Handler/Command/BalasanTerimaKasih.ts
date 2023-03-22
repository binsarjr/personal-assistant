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
    // dari chatgpt
    /terima kasih/i,
    /terimakasih/i,
    /terima\s+kasih/i,
    /terimakasih/i,
    /terima kasih banyak/i,
    /terimakasih banyak/i,
    /terima\s+kasih\s+banyak/i,
    /terimakasih\s+banyak/i,
    /makasih/i,
    /mks/i,
    /ma\s*kasih/i,
    /thanks/i,
    /thx/i,
    /thks/i,
    /thank\s+you/i,
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
