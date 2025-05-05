import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import type { WAMessage } from '@whiskeysockets/baileys';
import type { SocketClient } from 'baileys-decorators';
import { Context, OnText, Socket } from 'baileys-decorators';

export class HelpHandler {
  @OnText(PREFIX_COMMAND + 'help')
  async help(@Socket socket: SocketClient, @Context message: WAMessage) {
    const helpText = `
*🤖 Personal Assistant WhatsApp Bot*

_Halo! Berikut beberapa fitur utama yang bisa kamu gunakan:_

*📋 Menu Perintah:*
• *.help* — Tampilkan menu bantuan ini
• *.ping* — Info status bot & server
• *.ai <teks>* — Tanya Gemini AI (jawaban cerdas)
• *.s* / *.sticker* / *.stiker* — Ubah gambar jadi stiker
• *.tagall* — Mention semua anggota grup
• *.tagadmin* — Mention admin grup
• *.tagmember* — Mention member non-admin
• *.phones* — Lihat daftar nomor anggota grup
• *.stimg* — Ubah stiker jadi gambar

*✨ Fitur Otomatis:*
• Auto-reveal pesan view once & pesan terhapus
• Anti edit message (lihat pesan sebelum diedit)
• Downloader TikTok (download video TikTok)
`;
    socket.replyWithQuote({ text: helpText });
  }
}
