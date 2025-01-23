/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// https://330k.github.io/misc_tools/unicode_steganography.html

/**
 * Zero-Width Unicode Character Steganography
 * Copyright (c) 2015-2016 Kei Misawa
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

export const CHARS = {
  'COMBINING GRAPHEME JOINER': '\u034f',
  'ZERO WIDTH SPACE': '\u200b',
  'ZERO WIDTH NON-JOINER': '\u200c',
  'ZERO WIDTH JOINER': '\u200d',
  'LEFT-TO-RIGHT MARK': '\u200e',
  'LINE SEPARATOR': '\u2028',
  'PARAGRAPH SEPARATOR': '\u2029',
  'LEFT-TO-RIGHT EMBEDDING': '\u202a',
  'POP DIRECTIONAL FORMATTING': '\u202c',
  'LEFT-TO-RIGHT OVERRIDE': '\u202d',
  'FUNCTION APPLICATION': '\u2061',
  'INVISIBLE TIMES': '\u2062',
  'INVISIBLE SEPARATOR': '\u2063',
  'ZERO WIDTH NO-BREAK SPACE': '\ufeff',
};

export class UnicodeSteganographer {
  private chars: string[];
  private radix: number;
  private codelengthText: number;
  private codelengthBinary: number;

  constructor() {
    this.setUseChars(
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
  }

  /**
   * Set characters of coded hidden text (zero width characters)
   * @param newchars - string of zero width characters
   */
  setUseChars(newchars: string): void {
    if (newchars.length >= 2) {
      this.chars = newchars.split('');
      this.radix = this.chars.length;
      this.codelengthText = Math.ceil(Math.log(65536) / Math.log(this.radix));
      this.codelengthBinary = Math.ceil(Math.log(256) / Math.log(this.radix));
    }
    return null;
  }

  /**
   * Text Encoder
   * @param text - original text to be embedded
   * @param data - text to be hidden
   * @returns unicode stego text
   */
  encodeText(text: string, data: string): string {
    return this.combineShuffleString(
      text,
      this.encodeToZeroWidthCharactersText(data),
      this.codelengthText,
    );
  }

  /**
   * Binary Encoder
   * @param text - original text to be embedded
   * @param data - data to be hidden (Uint8Array)
   * @returns unicode stego text
   */
  encodeBinary(text: string, data: Uint8Array): string {
    return this.combineShuffleString(
      text,
      this.encodeToZeroWidthCharactersBinary(data),
      this.codelengthBinary,
    );
  }

  /**
   * Text Decoder
   * @param text - unicode text with steganography
   * @returns object with original text and hidden data
   */
  decodeText(text: string): { originalText: string; hiddenText: string } {
    const splitted = this.splitZeroWidthCharacters(text);
    return {
      originalText: splitted.originalText,
      hiddenText: this.decodeFromZeroWidthCharactersText(
        splitted.hiddenText,
        this.codelengthText,
      ),
    };
  }

  /**
   * Binary Decoder
   * @param text - unicode text with steganography
   * @returns object with original text and hidden data
   */
  decodeBinary(text: string): { originalText: string; hiddenData: Uint8Array } {
    const splitted = this.splitZeroWidthCharacters(text);
    return {
      originalText: splitted.originalText,
      hiddenData: this.decodeFromZeroWidthCharactersBinary(splitted.hiddenText),
    };
  }

  private encodeToZeroWidthCharactersText(str: string): string {
    const result = new Array(str.length);
    let base = '';
    let i;
    let c;
    let d;
    let r;

    //var base = '0'.repeat(codelength); // IE not support this method
    for (i = 0; i < this.codelengthText; i++) {
      base += '0';
    }

    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      d = c.toString(this.radix);

      result[i] = (base + d).substr(-this.codelengthText);
    }

    r = result.join('');

    for (i = 0; i < this.radix; i++) {
      r = r.replace(new RegExp(i, 'g'), this.chars[i]);
    }

    return r;
  }

  private encodeToZeroWidthCharactersBinary(u8ary: Uint8Array): string {
    const result = new Array(u8ary.length);
    let base = '';
    let i;
    let c;
    let d;
    let r;

    for (i = 0; i < this.codelengthBinary; i++) {
      base += '0';
    }

    for (i = 0; i < u8ary.length; i++) {
      d = u8ary[i].toString(this.radix);
      result[i] = (base + d).substr(-this.codelengthBinary);
    }

    r = result.join('');

    for (i = 0; i < this.radix; i++) {
      r = r.replace(new RegExp(i, 'g'), this.chars[i]);
    }

    return r;
  }

  private combineShuffleString(
    str1: string,
    str2: string,
    codelength: number,
  ): string {
    let result = [];
    const c0 = str1.split(
      /([\u0000-\u002F\u003A-\u0040\u005b-\u0060\u007b-\u007f])|([\u0030-\u0039]+)|([\u0041-\u005a\u0061-\u007a]+)|([\u0080-\u00FF]+)|([\u0100-\u017F]+)|([\u0180-\u024F]+)|([\u0250-\u02AF]+)|([\u02B0-\u02FF]+)|([\u0300-\u036F]+)|([\u0370-\u03FF]+)|([\u0400-\u04FF]+)|([\u0500-\u052F]+)|([\u0530-\u058F]+)|([\u0590-\u05FF]+)|([\u0600-\u06FF]+)|([\u0700-\u074F]+)|([\u0750-\u077F]+)|([\u0780-\u07BF]+)|([\u07C0-\u07FF]+)|([\u0800-\u083F]+)|([\u0840-\u085F]+)|([\u08A0-\u08FF]+)|([\u0900-\u097F]+)|([\u0980-\u09FF]+)|([\u0A00-\u0A7F]+)|([\u0A80-\u0AFF]+)|([\u0B00-\u0B7F]+)|([\u0B80-\u0BFF]+)|([\u0C00-\u0C7F]+)|([\u0C80-\u0CFF]+)|([\u0D00-\u0D7F]+)|([\u0D80-\u0DFF]+)|([\u0E00-\u0E7F]+)|([\u0E80-\u0EFF]+)|([\u0F00-\u0FFF]+)|([\u1000-\u109F]+)|([\u10A0-\u10FF]+)|([\u1100-\u11FF]+)|([\u1200-\u137F]+)|([\u1380-\u139F]+)|([\u13A0-\u13FF]+)|([\u1400-\u167F]+)|([\u1680-\u169F]+)|([\u16A0-\u16FF]+)|([\u1700-\u171F]+)|([\u1720-\u173F]+)|([\u1740-\u175F]+)|([\u1760-\u177F]+)|([\u1780-\u17FF]+)|([\u1800-\u18AF]+)|([\u18B0-\u18FF]+)|([\u1900-\u194F]+)|([\u1950-\u197F]+)|([\u1980-\u19DF]+)|([\u19E0-\u19FF]+)|([\u1A00-\u1A1F]+)|([\u1A20-\u1AAF]+)|([\u1AB0-\u1AFF]+)|([\u1B00-\u1B7F]+)|([\u1B80-\u1BBF]+)|([\u1BC0-\u1BFF]+)|([\u1C00-\u1C4F]+)|([\u1C50-\u1C7F]+)|([\u1CC0-\u1CCF]+)|([\u1CD0-\u1CFF]+)|([\u1D00-\u1D7F]+)|([\u1D80-\u1DBF]+)|([\u1DC0-\u1DFF]+)|([\u1E00-\u1EFF]+)|([\u1F00-\u1FFF]+)|([\u2000-\u206F]+)|([\u2070-\u209F]+)|([\u20A0-\u20CF]+)|([\u20D0-\u20FF]+)|([\u2100-\u214F]+)|([\u2150-\u218F]+)|([\u2190-\u21FF]+)|([\u2200-\u22FF]+)|([\u2300-\u23FF]+)|([\u2400-\u243F]+)|([\u2440-\u245F]+)|([\u2460-\u24FF]+)|([\u2500-\u257F]+)|([\u2580-\u259F]+)|([\u25A0-\u25FF]+)|([\u2600-\u26FF]+)|([\u2700-\u27BF]+)|([\u27C0-\u27EF]+)|([\u27F0-\u27FF]+)|([\u2800-\u28FF]+)|([\u2900-\u297F]+)|([\u2980-\u29FF]+)|([\u2A00-\u2AFF]+)|([\u2B00-\u2BFF]+)|([\u2C00-\u2C5F]+)|([\u2C60-\u2C7F]+)|([\u2C80-\u2CFF]+)|([\u2D00-\u2D2F]+)|([\u2D30-\u2D7F]+)|([\u2D80-\u2DDF]+)|([\u2DE0-\u2DFF]+)|([\u2E00-\u2E7F]+)|([\u2E80-\u2EFF]+)|([\u2F00-\u2FDF]+)|([\u2FF0-\u2FFF]+)|([\u3000-\u303F]+)|([\u3040-\u309F]+)|([\u30A0-\u30FF]+)|([\u3100-\u312F]+)|([\u3130-\u318F]+)|([\u3190-\u319F]+)|([\u31A0-\u31BF]+)|([\u31C0-\u31EF]+)|([\u31F0-\u31FF]+)|([\u3200-\u32FF]+)|([\u3300-\u33FF]+)|([\u3400-\u4DBF]+)|([\u4DC0-\u4DFF]+)|([\u4E00-\u9FFF]+)|([\uA000-\uA48F]+)|([\uA490-\uA4CF]+)|([\uA4D0-\uA4FF]+)|([\uA500-\uA63F]+)|([\uA640-\uA69F]+)|([\uA6A0-\uA6FF]+)|([\uA700-\uA71F]+)|([\uA720-\uA7FF]+)|([\uA800-\uA82F]+)|([\uA830-\uA83F]+)|([\uA840-\uA87F]+)|([\uA880-\uA8DF]+)|([\uA8E0-\uA8FF]+)|([\uA900-\uA92F]+)|([\uA930-\uA95F]+)|([\uA960-\uA97F]+)|([\uA980-\uA9DF]+)|([\uA9E0-\uA9FF]+)|([\uAA00-\uAA5F]+)|([\uAA60-\uAA7F]+)|([\uAA80-\uAADF]+)|([\uAAE0-\uAAFF]+)|([\uAB00-\uAB2F]+)|([\uAB30-\uAB6F]+)|([\uAB70-\uABBF]+)|([\uABC0-\uABFF]+)|([\uAC00-\uD7AF]+)|([\uD7B0-\uD7FF]+)|([\uD800-\uDFFF]+)|([\uE000-\uF8FF]+)|([\uF900-\uFAFF]+)|([\uFB00-\uFB4F]+)|([\uFB50-\uFDFF]+)|([\uFE00-\uFE0F]+)|([\uFE10-\uFE1F]+)|([\uFE20-\uFE2F]+)|([\uFE30-\uFE4F]+)|([\uFE50-\uFE6F]+)|([\uFE70-\uFEFF]+)|([\uFF00-\uFFEF]+)|([\uFFF0-\uFFFF]+)/g,
    );
    let c1 = [];
    let i;
    let j;
    for (i = 0; i < c0.length; i++) {
      if (typeof c0[i] !== 'undefined' && c0[i] !== '') {
        c1.push(c0[i]);
      }
    }
    let c2 = str2.split(new RegExp('(.{' + codelength + '})', 'g'));
    const ratio = c1.length / (c1.length + c2.length);

    /* slow
    while((c1.length > 0) && (c2.length > 0)){
      if(Math.random() <= ratio){
        result.push(c1.shift());
      }else{
        result.push(c2.shift());
      }
    }*/
    i = 0;
    j = 0;
    while (i < c1.length && j < c2.length) {
      if (Math.random() <= ratio) {
        result.push(c1[i]);
        i++;
      } else {
        result.push(c2[j]);
        j++;
      }
    }
    c1 = c1.slice(i);
    c2 = c2.slice(j);

    result = result.concat(c1).concat(c2);

    return result.join('');
  }

  private splitZeroWidthCharacters(str: string): {
    originalText: string;
    hiddenText: string;
  } {
    return {
      originalText: str.replace(
        new RegExp('[' + this.chars.join('') + ']', 'g'),
        '',
      ),
      hiddenText: str.replace(
        new RegExp('[^' + this.chars.join('') + ']', 'g'),
        '',
      ),
    };
  }

  private decodeFromZeroWidthCharactersText(
    str: string,
    codelength: number,
  ): string {
    let r = str;
    let i;
    const result = [];
    for (i = 0; i < this.radix; i++) {
      r = r.replace(new RegExp(this.chars[i], 'g'), i);
    }
    for (i = 0; i < r.length; i += this.codelengthText) {
      result.push(
        String.fromCharCode(
          parseInt(r.substr(i, this.codelengthText), this.radix),
        ),
      );
    }

    return result.join('');
  }

  private decodeFromZeroWidthCharactersBinary(str: string): Uint8Array {
    let r = str;
    let i;
    let j;
    const result = new Uint8Array(
      Math.ceil(str.length / this.codelengthBinary),
    );

    for (i = 0; i < this.radix; i++) {
      r = r.replace(new RegExp(this.chars[i], 'g'), i);
    }
    for (i = 0, j = 0; i < r.length; i += this.codelengthBinary, j++) {
      result[j] = parseInt(r.substr(i, this.codelengthBinary), this.radix);
    }

    return result;
  }
}
