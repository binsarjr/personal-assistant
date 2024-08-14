import { CHARS, UnicodeSteganographer } from './unicode.support';

export const randomString = (length: number): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
export const whatsappFormat = (text: string) => {
  // replace **text** to *text*
  text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
  // replace __text__ to _text_
  text = text.replace(/__(.*?)__/g, '_$1_');
  // replace [text](url) to *text* (url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '*$1* ($2)');
  // replace [text] to *text*
  text = text.replace(/\[(.*?)\]/g, '*$1*');
  // remove all headings (#)
  text = text.replace(/^#+/gm, '');
  return text;
};
/**
 * Ide nya adalah untuk menghindari terlabelkan sebagai spam dengan memberikan random hidden text yang berbeda.
 */
export const injectRandomHiddenText = (text: string) => {
  const stego = new UnicodeSteganographer();
  stego.setUseChars(
    [
      // CHARS['COMBINING GRAPHEME JOINER'],
      // CHARS['ZERO WIDTH SPACE'],
      CHARS['ZERO WIDTH NON-JOINER'],
      CHARS['ZERO WIDTH JOINER'],
      CHARS['LEFT-TO-RIGHT MARK'],
      // CHARS['LINE SEPARATOR'],
      // CHARS['PARAGRAPH SEPARATOR'],
      // CHARS['LEFT-TO-RIGHT EMBEDDING'],
      CHARS['POP DIRECTIONAL FORMATTING'],
      // CHARS['LEFT-TO-RIGHT OVERRIDE'],
      // CHARS['FUNCTION APPLICATION'],
      // CHARS['INVISIBLE TIMES'],
      // CHARS['INVISIBLE SEPARATOR'],
      CHARS['ZERO WIDTH NO-BREAK SPACE'],
    ].join(''),
  );

  return stego.encodeText(text, randomString(10));
};
