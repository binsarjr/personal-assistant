import { WASocket } from '@adiwajshing/baileys'
import { readFileSync } from 'fs'
import { join } from 'path'
import Queue from '../Facades/Queue'
import { sendMessageWTyping } from '../utils'

export const sendProfile = async (jid: string, socket: WASocket) =>
  Queue(() =>
    sendMessageWTyping(
      {
        image: readFileSync(join(__dirname, '../../asset/profile.jpg')),
        caption: `
Hai,

Namaku *Binsar Dwi Jasuma*, Seorang Software Engineer yang berdomisili di Yogyakarta, berusia 19 tahun.

Menyukai koding mulai dari SMK. Sudah menangani berbagai website dengan pengalaman selama 3 tahun.

Saat ini sedang tertarik dengan AI dan aktif membuat project open source.

Terima Kasih.
          `.trim(),
      },
      jid,
      socket,
    ),
  )
