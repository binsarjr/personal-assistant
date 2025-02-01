import { normalizePattern } from "$infrastructure/supports/regex";
import "reflect-metadata";

export const CommandMetadataKey = "whatsapp:command";

type CommandOptions = {
	pattern: string | RegExp;
	priority?: number;
};

export const Command = (options: string | RegExp | CommandOptions) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		let pattern: RegExp;
		let priority = 0;

		if (typeof options === "string" || options instanceof RegExp) {
			pattern = normalizePattern(options);
		} else {
			pattern = normalizePattern(options.pattern);
			priority = options.priority || 0;
		}

		// Simpan metadata dengan unique identifier
		const metadata = {
			pattern,
			priority,
			handler: descriptor.value,
			className: target.constructor.name, // Tambahkan nama class
		};

		Reflect.defineMetadata(CommandMetadataKey, metadata, target, propertyKey);
	};
};
