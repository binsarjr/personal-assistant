import makeWASocket, {
  BaileysEventMap,
  Browsers,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  makeCacheableSignalKeyStore,
} from '@adiwajshing/baileys'
import tempLogger from '@adiwajshing/baileys/lib/Utils/logger'
import { IEventListener } from '../Contracts/IEventListener'
import { ValidateError } from '../Exceptions'
import { Auth } from './Auth'
import { MemoryDataStore } from './Store/MemoryDataStore'

export class WhastappConnection {
  socket: WASocket | undefined

  private events: {
    event: keyof BaileysEventMap
    listener: (arg: { props: any; socket: WASocket }) => any
  }[] = []
  constructor(private auth: Auth, private store: MemoryDataStore) {}

  onEvents<T extends keyof BaileysEventMap>(
    event: T,
    listener: IEventListener<T>,
  ) {
    this.events.push({
      event,
      listener,
    })
  }

  async createConnection() {
    const [{ version, isLatest }, state] = await Promise.all([
      fetchLatestBaileysVersion(),
      this.auth.getState(),
    ])

    this.socket = makeWASocket({
      logger: tempLogger,
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, tempLogger),
      },
      // ignore all broadcast and status messages -- to receive the same
      // comment the line below out
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) || isJidStatusBroadcast(jid),
      generateHighQualityLinkPreview: true,
      // can use Windows, Ubuntu here too
      browser: Browsers.macOS('Desktop'),
      syncFullHistory: true,
      // solusi bug button dan semacamnya tidak tampil
      // https://github.com/adiwajshing/Baileys/issues/2328#issuecomment-1316161411
      patchMessageBeforeSending: (message) => {
        const requiresPatch = !!(
          message.buttonsMessage ||
          message.templateMessage ||
          message.listMessage
        )
        if (requiresPatch) {
          message = {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadataVersion: 2,
                  deviceListMetadata: {},
                },
                ...message,
              },
            },
          }
        }

        return message
      },
    })
    this.store.store.bind(this.socket.ev)

    this.socket.ev.process(
      // events is a map for event name => event data
      async (events) => {
        // something about the connection changed
        // maybe it closed, or we received all offline message or connection opened
        if (events['connection.update']) {
          const update = events['connection.update']
          const { connection, lastDisconnect } = update
          if (connection === 'close') {
            // reconnect if not logged out
            if (
              (lastDisconnect?.error as any)?.output?.statusCode !==
              DisconnectReason.loggedOut
            ) {
              this.createConnection()
            } else {
              console.log('Connection closed. You are logged out.')
            }
          }

          console.log('connection update', update)
        }

        // credentials updated -- save them
        if (events['creds.update']) {
          await this.auth.saveCreds()
        }

        if (events.call) {
          console.log('recv call event', events.call)
        }

        // history received
        if (events['messaging-history.set']) {
          const { chats, contacts, messages, isLatest } = events[
            'messaging-history.set'
          ]
          console.log(
            `recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`,
          )
        }

        // received a new message
        // if (events['messages.upsert']) {
        //   const upsert = events['messages.upsert']
        //   console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

        //   if (upsert.type === 'notify') {
        //     for (const msg of upsert.messages) {
        //       console.log(msg)
        //       console.log(JSON.stringify(msg, null, 2))
        //       //   if (!msg.key.fromMe && doReplies) {
        //       //     console.log('replying to', msg.key.remoteJid)
        //       //     await sock!.readMessages([msg.key])
        //       //     await sendMessageWTyping(
        //       //       { text: 'Hello there!' },
        //       //       msg.key.remoteJid!,
        //       //     )
        //       //   }
        //     }
        //   }
        // }

        // messages updated like status delivered, message deleted etc.
        if (events['messages.update']) {
          console.log(
            JSON.stringify(events['messages.update'], null, 1),
            'mesasge updat',
          )
        }

        // if (events['message-receipt.update']) {
        //   console.log(events['message-receipt.update'])
        // }

        // if (events['messages.reaction']) {
        //   console.log(events['messages.reaction'])
        // }

        // if (events['presence.update']) {
        //   console.log(events['presence.update'])
        // }

        // if (events['chats.update']) {
        //   console.log(events['chats.update'])
        // }

        // if (events['contacts.update']) {
        //   for (const contact of events['contacts.update']) {
        //     if (typeof contact.imgUrl !== 'undefined') {
        //       const newUrl =
        //         contact.imgUrl === null
        //           ? null
        //           : await sock!.profilePictureUrl(contact.id!).catch(() => null)
        //       console.log(
        //         `contact ${contact.id} has a new profile pic: ${newUrl}`,
        //       )
        //     }
        //   }
        // }

        // if (events['chats.delete']) {
        //   console.log('chats deleted ', events['chats.delete'])
        // }

        for (const { event, listener } of this.events) {
          if (events[event])
            Promise.resolve(
              listener({
                props: events[event],
                socket: this.socket!,
              }),
            ).catch((error) => {
              if (error instanceof ValidateError) {
                console.log(error)
              } else {
                throw error
              }
            })
        }
      },
    )
    return this.socket
  }
}
