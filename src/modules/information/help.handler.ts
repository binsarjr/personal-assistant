import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import type { WAMessage } from '@whiskeysockets/baileys';
import type { SocketClient } from 'baileys-decorators';
import { Context, OnText, Socket } from 'baileys-decorators';

export class HelpHandler {
  @OnText(PREFIX_COMMAND + 'help')
  async help(@Socket socket: SocketClient, @Context message: WAMessage) {
    const helpText = `
*Personal Assistant WhatsApp Bot*

*Fitur Utama:*
• .help — Menampilkan menu ini
• .ping — Info server & status bot
• .ai <teks> — Tanya Gemini AI
• .s / .sticker / .stiker — Gambar ke stiker
• .tagall / .tagadmin / .tagmember — Mention grup
• .phones — List nomor grup

*Fitur Otomatis:*
• Auto-reveal view once & deleted message
• Anti edit message
• Downloader TikTok

*Mode Multi-Session & Pairing*
• Jalankan banyak sesi WhatsApp sekaligus
• Mendukung login QR & pairing code

_Bot by binsarjr_
`;
    socket.replyWithQuote({ text: helpText });
  }
}
