import { logger } from "$infrastructure/logger/console.logger";

export type HandlerCommandEntry = {
	handler: Function;
	meta: {
		methodName: string;
		socketParamIndex?: number;
	};
	methodName: string;
	className: string;
	pattern: RegExp;
} & Partial<{
	priority: number;
}>;

export class HandlerCommandRegistry {
	private static handlers = new Map<string, HandlerCommandEntry[]>();

	static register(handler: HandlerCommandEntry) {
		const key = `${handler.className}_${handler.methodName}`;

		logger.info(
			`Registering command "${handler.pattern}" from ${handler.className}.${handler.methodName}`
		);
		if (!this.handlers.has(key)) {
			this.handlers.set(key, []);
		}
		this.handlers.get(key)?.push(handler);
	}

	static getHandlers(pattern: string): HandlerCommandEntry[] {
		return Array.from(this.handlers.values())
			.flat()
			.filter((entry) => entry.pattern.test(pattern))
			.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
	}
}
