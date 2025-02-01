import bootstrapConfig from "$infrastructure/config/bootstrap.config";

import { CommandMetadataKey } from "$core/decorators";
import {
	HandlerCommandRegistry,
	type HandlerCommandEntry,
} from "$core/di/handler-command.registry";
import { base_path } from "$infrastructure/supports/file.support";
import { Glob } from "bun";
import "reflect-metadata";

for (const commandGlob of bootstrapConfig.handlers) {
	const glob = new Glob(commandGlob);

	for await (const filepath of glob.scan()) {
		const fullPath = base_path(filepath);

		const module = await import(fullPath);

		for (const [className, HandlerClass] of Object.entries(module)) {
			if (typeof HandlerClass !== "function") continue;

			const proto = HandlerClass.prototype;
			const methodNames = Object.getOwnPropertyNames(proto);

			for (const methodName of methodNames) {
				if (methodName === "constructor") continue;

				const metadata = Reflect.getMetadata(
					CommandMetadataKey,
					proto,
					methodName
				);

				const socketParamIndex = Reflect.getMetadata(
					`socketParam:${methodName}`,
					proto
				);

				let entry: HandlerCommandEntry = {
					...metadata,
					className,
					methodName,
					// @ts-expect-error: nullable
					handler: proto[methodName].bind(new HandlerClass()),
				};

				if (typeof socketParamIndex !== "undefined") {
					entry = {
						...entry,
						meta: {
							...entry.meta,
							socketParamIndex: socketParamIndex,
						},
					};
				}

				if (metadata) {
					HandlerCommandRegistry.register(entry);
				}
			}
		}
	}
}
