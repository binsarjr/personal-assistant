import { isJidGroup, jidNormalizedUser } from '@adiwajshing/baileys'
import { join } from 'path'
import { WAEvent } from '../Contracts/WaEvent'
import { ValidateError } from '../Exceptions'
import { neuralNetwork, text2vec } from '../nlp/neural'
import { getMessageCaption } from '../utils'
import { Auth } from './Auth'
import { MessageUpsert } from './Events/Message/MessageUpsert'
import { MessageUpsertButtonResponse } from './Events/Message/MessageUpsertButtonResponse'
import { MessageUpsertListResponse } from './Events/Message/MessageUpsertListResponse'
import { MessageUpsertWithNlp } from './Events/Message/MessageUpsertWithNlp'
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
  async clearDataStore() {
    Object.keys(this.store.store.messages).map((key) => {
      const messeges = this.store.store.messages[key]
      messeges.clear()
    })
    this.store.store.chats.clear()
    this.store.writeToFile()
  }

  async start() {
    this.conn = new WhastappConnection(this.auth, this.store)
    this.handlers.map((handler) => {
      if (
        handler instanceof MessageUpsert ||
        handler instanceof MessageUpsertButtonResponse
      ) {
        this.resolveMessageUpsert(handler)
      }
    })

    this.conn.createConnection()
  }
  private resolveMessageUpsert(
    handler:
      | MessageUpsert
      | MessageUpsertButtonResponse
      | MessageUpsertListResponse,
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
            /**
             * Mendapatkan keterangan pesan dan memvalidasi pola cocok.
             *
             * @param message - pesan yang dikirim.
             * @param handler - pemegang data pola yang valid.
             */
            const text = getMessageCaption(message.message)
            if (handler.patterns) validatePatternMatch(text, handler.patterns)

            /**
             * Memvalidasi handler MessageUpsertWithNlp dan mendapatkan data dengan
             * memproses NlpResponse dari teks yang diberikan.
             * Score dan intent dari NlpResponse harus sesuai dengan expectMinScore dan
             * expectIntent dari handler.
             * Jika nilai score dan intent tidak sesuai, maka akan menghasilkan error
             * ValidateError.
             *
             * @param handler - handler untuk memvalidasi.
             * @param text - teks untuk di proses.
             */
            if (handler instanceof MessageUpsertWithNlp) {
              const response: { [i: string]: number } = neuralNetwork.run(
                text2vec(text),
              )
              console.log(response, handler)
              if (
                !(
                  (response[handler.expectIntent] ?? 0) >=
                  handler.expectMinScore
                )
              ) {
                throw new ValidateError('Expect score dan intent tidak sesuai')
              }
            }
          } else if (handler instanceof MessageUpsertButtonResponse) {
            /**
             * Memastikan bahwa 'selectedId' yang dipilih cocok dengan proses saat ini.
             *
             * @param message - berisi informasi yang dibutuhkan untuk melakukan validasi.
             * @param handler - data yang dibutuhkan untuk melakukan validasi.
             * @throws ValidateError - jika 'selectedId' yang dipilih tidak cocok dengan
             * proses saat ini.
             */
            const selectedId =
              message.message?.templateButtonReplyMessage?.selectedId ||
              message.message?.buttonsResponseMessage?.selectedButtonId
            if (handler.selectedId != selectedId)
              throw new ValidateError(
                'Selected id tidak sesuai dengan proses saat ini',
              )
          } else if (handler instanceof MessageUpsertListResponse) {
            /**
             * Memvalidasi apakah id yang terpilih sesuai dengan handler.selectedId.
             * Jika tidak sesuai, fungsi akan melemparkan sebuah error bernama ValidateError
             * dengan pesan 'Selected id tidak sesuai dengan proses saat ini'.
             *
             * @param message - informasi yang diperlukan untuk memvalidasi id yang
             * terpilih.
             * @param handler - informasi mengenai proses saat ini.
             * @returns void.
             */
            const selectedRowId =
              message.message?.listResponseMessage?.singleSelectReply
                ?.selectedRowId
            if (handler.selectedId != selectedRowId)
              throw new ValidateError(
                'Selected id tidak sesuai dengan proses saat ini',
              )
          }

          ValidateChatAccess(
            jid,
            handler.chat,
            message.message!,
            args.socket.user!.id,
          )

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
            if (handler.fromMe)
              handler.participants.push(jidNormalizedUser(args.socket.user?.id))
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
