import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../Contracts/IEventListener'
import { MessageUpsert } from '../Facades/Events/Message/MessageUpsert'
import Queue from '../Facades/Queue'
import { sendMessageWTyping, toInCaseSensitive } from '../utils'

export class Halo extends MessageUpsert {
  participants: string[] = []
  chat: 'all' | 'group' | 'user' = 'user'
  patterns = [toInCaseSensitive('hai'), toInCaseSensitive('halo')]
  handler({
    socket,
    props: upsert,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = upsert.message.key.remoteJid || ''
    Queue(() =>
      sendMessageWTyping(
        {
          text: 'Halo saya Binsar Dwi Jasuma ada yang bisa saya bantu?',
        },
        jid,
        socket,
      ),
    )

    // Queue(() =>
    //   sendMessageWTyping(
    //     {
    //       text: "Hi it's a template message",
    //       footer: 'Hello World',
    //       templateButtons: [
    //         {
    //           index: 1,
    //           urlButton: {
    //             displayText: '⭐ Star Baileys on GitHub!',
    //             url: 'https://github.com/adiwajshing/Baileys',
    //           },
    //         },
    //         {
    //           index: 2,
    //           callButton: {
    //             displayText: 'Call me!',
    //             phoneNumber: '+1 (234) 5678-901',
    //           },
    //         },
    //         {
    //           index: 3,
    //           quickReplyButton: {
    //             displayText: 'This is a reply, just like normal buttons!',
    //             id: 'id-like-buttons-message',
    //           },
    //         },
    //       ],
    //     },
    //     jid,
    //     socket,
    //   ),
    // )
  }
}
