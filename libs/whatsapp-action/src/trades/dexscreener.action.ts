import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getMessageCaption,
  withoutFlag,
} from '@app/whatsapp/supports/message.support';
import { getDexPairData } from '@src/services/dexscreener';
import { Gemini } from '@src/services/gemini';
import { whatsappFormat } from '@src/supports/str.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('(sol|eth|matic|btc|sui) .*')],
})
export class DexScreenerAction extends WhatsappMessageAction {
  getSystemInstruction() {
    return `
You are an experienced blockchain trading analyst. 
Your task is to assist users in conducting trading analysis 
by providing deep insights and effective strategies. 
Use your knowledge of the blockchain market to offer 
valuable advice and help users make informed trading decisions.
your fun and friendly, and add an emoji in conversation like (chart emoji or something else that for trading). 
Don't forget to give a warning to remain careful and this is just an analysis.
answer as simply as you can.
    `;
  }
  async execute(socket: WASocket, message: WAMessage): Promise<void> {
    this.reactToProcessing(socket, message);
    const [type, tokenAddress] = withoutFlag(
      getMessageCaption(message.message!),
    ).split(/\s+/, 2);

    const mapping = {
      sol: 'solana',
      eth: 'ethereum',
      matic: 'polygon',
      btc: 'bitcoin',
      sui: 'sui',
    };

    console.log(type, tokenAddress);

    if (!mapping[type.toLowerCase()]) {
      return;
    }

    try {
      const pairData = await getDexPairData(mapping[type], tokenAddress);

      const gemini = Gemini.make();
      gemini.addContent({
        role: 'user',
        parts: [
          {
            text:
              'analysis of the results of this api from dexscreener without tell me this from dexscreener:\n' +
              JSON.stringify(pairData),
          },
        ],
      });

      const model = gemini.getModel();

      const response = await model.generateContent({
        systemInstruction: this.getSystemInstruction(),
        generationConfig: {
          temperature: 1,
        },
        contents: gemini.getPrompts(),
      });

      await socket.sendMessage(
        message.key.remoteJid,
        {
          text: whatsappFormat(response.response.text()),
        },
        {
          quoted: message,
        },
      );
      this.reactToDone(socket, message);
    } catch (error) {
      await socket.sendMessage(
        message.key.remoteJid,
        {
          text: error.toString(),
        },
        {
          quoted: message,
        },
      );
      this.reactToFailed(socket, message);
    }
  }
}
