import { MessageUpsertType, proto } from '@whiskeysockets/baileys'
import { HandlerArgs } from '../Contracts/IEventListener'
import { MessageUpsert } from '../Facades/Events/Message/MessageUpsert'
import Queue from '../Facades/Queue'
import { sendMessageWTyping } from '../utils'

export class CobaButton extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = ['testing']

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
          text: "Hi it's button message",
          footer: 'Hello World',
          buttons: [
            {
              buttonId: 'id1',
              buttonText: { displayText: 'Button 1' },
              type: 1,
            },
            {
              buttonId: 'id2',
              buttonText: { displayText: 'Button 2' },
              type: 1,
            },
            {
              buttonId: 'id3',
              buttonText: { displayText: 'Button 3' },
              type: 1,
            },
          ],
          // @ts-ignore
          headerType: 1,
        },
        jid,
        socket,
      ),
    )

    Queue(() =>
      sendMessageWTyping(
        {
          text: "Hi it's a template message",
          footer: 'Hello World',
          templateButtons: [
            {
              index: 1,
              urlButton: {
                displayText: '⭐ Star Baileys on GitHub!',
                url: 'https://github.com/whiskeysockets/Baileys',
              },
            },
            {
              index: 2,
              callButton: {
                displayText: 'Call me!',
                phoneNumber: '+1 (234) 5678-901',
              },
            },
            {
              index: 3,
              quickReplyButton: {
                displayText: 'This is a reply, just like normal buttons!',
                id: 'id-like-buttons-message',
              },
            },
          ],
        },
        jid,
        socket,
      ),
    )

    Queue(() =>
      sendMessageWTyping(
        {
          text: 'This is a list',
          footer: 'nice footer, link: https://google.com',
          title: 'Amazing boldfaced list title',
          buttonText: 'Required, text on the button to view the list',
          sections: [
            {
              title: 'Section 1',
              rows: [
                { title: 'Option 1', rowId: 'option1' },
                {
                  title: 'Option 2',
                  rowId: 'option2',
                  description: 'This is a description',
                },
              ],
            },
            {
              title: 'Section 2',
              rows: [
                { title: 'Option 3', rowId: 'option3' },
                {
                  title: 'Option 4',
                  rowId: 'option4',
                  description: 'This is a description V2',
                },
              ],
            },
          ],
        },
        jid,
        socket,
      ),
    )
  }
}
