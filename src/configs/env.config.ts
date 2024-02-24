import type { EnvRule } from "../types/env.js";

// Buat fungsi utilitas untuk membuat EnvRules bersama dengan tipenya
const createEnvRules = <T extends Record<string, EnvRule>>(rules: T) => rules;

export const ENV_RULES = createEnvRules({
	BOT_NAME: {
		required: false,
		default: "bangbin",
	},
	GEMINI_API_KEY: {
		required: true,
	},
	DATABASE_FILE: {
		required: false,
		default: "database.json",
	},
	COMMAND_SIGN: {
		required: false,
		default: ".",
	},
} as const);
