import type { MessagePattern } from "../types/MessagePattern.js";

export const withSign = (command: string): string =>
	process.env.COMMAND_SIGN + command;

export const patternsAndTextIsMatch = (
	patterns: MessagePattern,
	text: string
): boolean => {
	if (typeof patterns === "boolean") {
		return patterns;
	}

	if (Array.isArray(patterns)) {
		if (patterns.length === 0) {
			return false;
		}
	} else {
		patterns = [patterns] as MessagePattern;
	}

	if (Array.isArray(patterns)) {
		for (const pattern of patterns) {
			if (typeof pattern === "string") {
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
