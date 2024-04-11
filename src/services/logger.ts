import P from 'pino';
import PinoPretty from 'pino-pretty';

export const Logger = (options: P.LoggerOptions = {}) => {
  return P(
    options,
    PinoPretty({
      singleLine: true,
    }),
  );
};
