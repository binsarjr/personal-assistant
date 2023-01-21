import { isJidGroup } from '@adiwajshing/baileys'
import { join } from 'path'
import { WAEvent } from '../Contracts/WaEvent'
import { ValidateError } from '../Exceptions'
import { getMessageCaption } from '../utils'
import { Auth } from './Auth'
import { MessageUpsert } from './Events/Message/MessageUpsert'
import { MessageUpsertTemplateButton } from './Events/Message/MessageUpsertTemplateButton'
import { MemoryDataStore } from './Store/MemoryDataStore'
import { ValidateChatAccess } from './Validation/ValidateChatAccess'
import { ValidateGroupAccess } from './Validation/ValidateGroupAccess'
import { ValidateParticipantsAllowed } from './Validation/ValidateParticipantsAllowed'
import { validatePatternMatch } from './Validation/ValidatePatternMatch'
import { WhastappConnection } from './WhatsappConnection'

export class WhatsappClient {
  private auth: Auth
  private conn: WhastappConnection | undefined
  private handlers: WAEvent[] = []
  private store: MemoryDataStore
  constructor({
    name,
    folderAuth = join(__dirname, '../../.auths'),
  }: {
    name: string
    folderAuth?: string
  }) {
    this.auth = new Auth(folderAuth, name)
    const storepath = join(folderAuth, name + '_store.json')
    this.store = new MemoryDataStore(storepath)
  }

  addHandler(...events: WAEvent[]) {
    events.map((event) => this.handlers.push(event))
  }

  async start() {
    this.conn = new WhastappConnection(this.auth, this.store)
    this.handlers.map((handler) => {
      if (
        handler instanceof MessageUpsert ||
        handler instanceof MessageUpsertTemplateButton
      ) {
        this.resolveMessageUpsert(handler)
      }
    })

    this.conn.createConnection()
  }
  private resolveMessageUpsert(
    handler: MessageUpsert | MessageUpsertTemplateButton,
  ) {
    this.conn?.onEvents('messages.upsert', async (args) => {
      if (handler.type == 'all' || handler.type == args.props.type) {
        for (const message of args.props.messages) {
          const jid = message.key.remoteJid || ''
          if (!message?.message) break

          /**
           * Memvalidasi message yang dikirim.
           *
           * @param handler - Mengandung informasi tentang pesan yang diterima.
           * @param message - Pesan yang diterima.
           * @returns void
           */
          if (handler instanceof MessageUpsert) {
            const text = getMessageCaption(message.message)
            if (handler.patterns) validatePatternMatch(text, handler.patterns)
          } else if (handler instanceof MessageUpsertTemplateButton) {
            const selectedId =
              message.message.templateButtonReplyMessage?.selectedId
            if (handler.selectedId != selectedId)
              throw new ValidateError(
                'Selected id tidak sesuai dengan proses saat ini',
              )
          }

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
           * Memeriksa apakah pesan diteruskan atau tidak.
           * Jika onlyMe adalah true, pesan hanya akan diteruskan jika fromMe adalah true.
           * Jika fromMe adalah false, pesan hanya akan diteruskan jika fromMe bukanlah
           * true.
           *
           * @param handler - mengandung informasi untuk menentukan apakah pesan
           * diteruskan atau tidak.
           * @param message - mengandung informasi tentang pesan.
           */
          if (handler.onlyMe) {
            if (!message.key.fromMe) break
          } else if (!handler.fromMe) if (message.key.fromMe) break

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
