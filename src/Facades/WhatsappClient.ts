import { join } from 'path'
import { WAEvent } from '../Contracts/WaEvent'
import { getMessageCaption, validatePattern } from '../utils'
import { Auth } from './Auth'
import { MessageUpsert } from './Events/Message/MessageUpsert'
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
    this.conn?.onEvents('messages.upsert', (args) => {
      if (handler.type == 'all' || handler.type == args.props.type) {
        for (const message of args.props.messages) {
          if (!message?.message) break

          /**
           * Pengecekan apakah peserta ada dalam daftar peserta.
           * Jika peserta ada dalam daftar, perintah dilanjutkan.
           */
          if (handler.participants) {
            const participant =
              message.key.participant || message.key.remoteJid || ''
            const participants = handler.getParticipants()
            if (!participants.includes(participant)) break
          }

          /**
           * Periksa apakah pesan datang dari diri sendiri.
           * Jika pesan datang dari diri sendiri, hentikan proses.
           * kecuali jika handler mengijinkan pesan datang dari diri sendiri.
           */
          if (!handler.fromMe) if (message.key.fromMe) break

          console.log(JSON.stringify(message, null, 2))

          /**
           * Mendapatkan potongan pesan dan melakukan validasi pola yang diberikan.
           */
          const text = getMessageCaption(message.message)
          if (handler.patterns) {
            let isMatch = false
            if (Array.isArray(handler.patterns)) {
              for (const pattern of handler.patterns) {
                isMatch = validatePattern(pattern, text)
                if (isMatch) break
              }
            } else {
              isMatch = validatePattern(handler.patterns, text)
            }

            if (!isMatch) break
          }

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
