import { logger } from "$infrastructure/logger/console.logger";

export const serviceLogger = logger.child({ module: "service" });

export const geminiLogger = serviceLogger.child({ module: "gemini" });
