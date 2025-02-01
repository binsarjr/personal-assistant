import type { SocketClient } from "$infrastructure/whatsapp/types";
import type { WAMessage } from "@whiskeysockets/baileys";
import "reflect-metadata";

type CommandMiddlewareFunction = (
	socket: SocketClient,
	ctx: WAMessage
) => Promise<boolean> | boolean;

const commandMiddlewareMap = new Map<string, CommandMiddlewareFunction[]>();

export { commandMiddlewareMap };

export const createMiddleware = (middleware: CommandMiddlewareFunction) => {
	return middleware;
};

export const CommandMiddleware = (
	...middlewares: CommandMiddlewareFunction[]
) => {
	return (
		target: any,
		propertyKey: string,
		_descriptor: PropertyDescriptor
	) => {
		const originalClassName = target.constructor.name;

		const currentMiddlewares =
			commandMiddlewareMap.get(originalClassName + ":" + propertyKey) || [];

		currentMiddlewares.push(...middlewares);

		commandMiddlewareMap.set(
			originalClassName + ":" + propertyKey,
			currentMiddlewares
		);
	};
};
