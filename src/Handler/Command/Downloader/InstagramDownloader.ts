import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import {
  instagramdl,
  instagramdlv2,
  instagramdlv3,
  instagramdlv4
} from '@bochilteam/scraper'
import got from 'got'
import { HandlerArgs } from '../../../Contracts/IEventListener'
import { MessageUpsert } from '../../../Facades/Events/Message/MessageUpsert'
import Queue from '../../../Facades/Queue'
import { getMessageCaption, sendMessageWTyping } from '../../../utils'

const download = async (link: string): Promise<string[]> => {
  // @ts-ignore
  const res = await Promise.any([
    (async () => {
      const res = await instagramdl(link)
      console.log(res,'v1')
      return res.map((r) => r.url)
    })(),
    (async () => {
      const res = await instagramdlv2(link)
      console.log(res,'v2')
      return res.map((r) => r.url)
    })(),
    (async () => {
      const res = await instagramdlv3(link)
      console.log(res,'v2')
      return res.medias.map((m) => m.url)
    })(),
    (async () => {
      const res = await instagramdlv4(link)
      console.log(res,'v4')
      return res.map((r) => r.url)
    })(),
  ])
  return res
}

export class InstagramDownloader extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = [
    new RegExp('/ig .*', 'i'),
  ]
  fromMe: boolean = true
  onlyMe: boolean = true
  handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const text = getMessageCaption(props.message.message!)
    const urls: URL[] = []
    text.split(/\s+/).map((url) => {
      try {
        urls.push(new URL(url))
      } catch (error) {}
    })
    const jid = props.message.key.remoteJid!
    urls.map(async (url) => {
      try {
        const videoUrls = await download(url.toString())
        console.log(videoUrls)
        videoUrls.map((url) =>
          Queue(() =>
            (async () => {
              const res = await got.head(url)
              const isImage = /^image/.test(res.headers['content-type'] || '')
              if (isImage) {
                return sendMessageWTyping(
                  {
                    image: {
                      url,
                    },
                  },
                  jid,
                  socket,
                )
              } else {
                return sendMessageWTyping(
                  {
                    video: {
                      url,
                    },
                  },
                  jid,
                  socket,
                )
              }
            })(),
          ),
        )
      } catch (error) {}
    })
  }
}
