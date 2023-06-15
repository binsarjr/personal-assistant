import { MessageUpsertType, proto } from '@whiskeysockets/baileys'
import { HandlerArgs } from '../../../Contracts/IEventListener'
import { MessageUpsert } from '../../../Facades/Events/Message/MessageUpsert'
import Queue from '../../../Facades/Queue'
import { getMessageCaption, sendMessageWTyping } from '../../../utils'

const download = async (link: string): Promise<{video:string;images:string[]}> => {
  // @ts-ignore
  // const res = await Promise.any([
  //   (async () => {
  //     const res = await tiktokdl(link)
  //     console.log(res, 'v1')
  //     return (
  //       res.video.no_watermark_hd
  //     )
  //   })(),
  // (async () => {
  //   const res = await tiktokdlv2(link)
  //   console.log(res, 'v2')
  //   return res.video.no_watermark_hd || res.video.no_watermark
  // })(),
  // (async () => {
  //   const res = await tiktokdlv3(link)
  //   console.log(res, 'v3')
  //   return res.video.no_watermark2 || res.video.no_watermark
  // })(),
  // ])
  const resp = await fetch('https://mediasaver.vercel.app/services/tiktok/snaptik?url=' + link)
  const json: { video: string,images:string[] } = await resp.json()
  return json
}

export class TiktokDownloader extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = [
    new RegExp('^(/|\\.)tt .*', 'i'),
    new RegExp('^(/|\\.)vt .*', 'i'),
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
      } catch (error) { }
    })
    const jid = props.message.key.remoteJid!
    urls.map(async (url) => {
      try {
        const {video,images} = await download(url.toString())
        await Queue(() =>
          sendMessageWTyping(
            {
              video: {
                url: video,
              },
            },
            jid,
            socket,
          ),
        )
        images.map(image => Queue(() =>
          sendMessageWTyping(
            {
              image: {
                url: image,
              },
            },
            jid,
            socket,
          ),
        ))
      } catch (error) { }
    })
  }
}
