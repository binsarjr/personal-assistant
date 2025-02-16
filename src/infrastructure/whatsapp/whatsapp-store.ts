import { logger } from '$infrastructure/logger/console.logger';
import makeInMemoryStore from '$infrastructure/whatsapp/make-in-memory-store';

const wa_store = makeInMemoryStore({
  logger: logger.child({ module: 'baileys-multi-store' }),
});

export default wa_store;
