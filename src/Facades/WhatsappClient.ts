import { isJidGroup } from '@adiwajshing/baileys'
import { join } from 'path'
import { WAEvent } from '../Contracts/WaEvent'
import { getMessageCaption } from '../utils'
import { Auth } from './Auth'
import { MessageUpsert } from './Events/Message/MessageUpsert'
import { ValidateChatAccess } from './Validation/ValidateChatAccess'
import { ValidateGroupAccess } from './Validation/ValidateGroupAccess'
import { ValidateParticipantsAllowed } from './Validation/ValidateParticipantsAllowed'
import { validatePatternMatch } from './Validation/ValidatePatternMatch'
import { WhastappConnection } from './WhatsappConnection'

export class WhatsappClient {
  private auth: Auth
  private conn: WhastappConnection | undefined
  private handlers: WAEvent[] = []
  constructor({
    name,
    folderAuth = join(__dirname, '../../.auths'),
  }: {
    name: string
    folderAuth?: string
  }) {
    this.auth = new Auth(folderAuth, name)
  }

  addHandler(event: WAEvent) {
    this.handlers.push(event)
  }

  async start() {
    this.conn = new WhastappConnection(this.auth)
    this.handlers.map((handler) => {
      if (handler instanceof MessageUpsert) {
        this.resolveMessageUpsert(handler)
      }
      // else if
    })

    this.conn.createConnection()
  }
  private resolveMessageUpsert(handler: MessageUpsert) {
    this.conn?.onEvents('messages.upsert', async (args) => {
      if (handler.type == 'all' || handler.type == args.props.type) {
        for (const message of args.props.messages) {
          const jid = message.key.remoteJid || ''
          if (!message?.message) break

          const text = getMessageCaption(message.message)
          if (handler.patterns) validatePatternMatch(text, handler.patterns)

          ValidateChatAccess(jid, handler.chat)

          /**
           * Lakukan suatu proses apabila pesan yang masuk berasal dari grup
           */
          if (isJidGroup(jid)) {
            if (handler.groupAccess !== 'all') {
              const participant = message.key.participant || ''
              const participants = (await args.socket.groupMetadata(jid))
                .participants
              ValidateGroupAccess(
                handler.groupAccess,
                participant,
                participants,
              )
            }
          }

          if (handler.participants) {
            const participant =
              message.key.participant || message.key.remoteJid || ''
            const participants = handler.getParticipants()

            ValidateParticipantsAllowed(participant, participants)
          }

          /**
           * Periksa apakah pesan datang dari diri sendiri.
           * Jika pesan datang dari diri sendiri, hentikan proses.
           * kecuali jika handler mengijinkan pesan datang dari diri sendiri.
           */
          if (!handler.fromMe) if (message.key.fromMe) break
          /**
           * Jika hanya mengizinkan pesan dari pengirim, maka hentikan proses jika pesan
           * tidak dari pengirim.
           */
          if (handler.onlyMe && !message.key.fromMe) break

          console.log(JSON.stringify(message, null, 2))

          handler.handler({
            props: {
              message,
              type: args.props.type,
            },
            socket: args.socket,
          })
        }
      }
    })
  }
}
