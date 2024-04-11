import type { Flags } from '@app/whatsapp/types/flags.type';

export const withSign = (command: string): string =>
  (process.env.COMMAND_SIGN || '') + command;
export const withSignRegex = (command: string): RegExp =>
  new RegExp(`^\\${process.env.COMMAND_SIGN || ''}${command}`, 'i');

export const patternsAndTextIsMatch = (
  patterns: Flags,
  text: string,
): boolean => {
  if (typeof patterns === 'boolean') {
    return patterns;
  }

  if (Array.isArray(patterns)) {
    if (patterns.length === 0) {
      return false;
    }
  } else {
    patterns = [patterns] as Flags;
  }

  if (Array.isArray(patterns)) {
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (text.toLowerCase() === pattern.toLowerCase()) {
          return true;
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(text)) {
          return true;
        }
      }
    }
  }

  return false;
};
