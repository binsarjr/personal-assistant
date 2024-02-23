import "dotenv/config";
import { ENV_RULES } from "../configs/env.config.js";
import type { EnvRules } from "../types/env.js";

export const loadEnv = () => {
	const rules = ENV_RULES as EnvRules;
	for (const rule of Object.keys(rules)) {
		process.env[rule] = process.env[rule] || (rules[rule].default as string);

		if (!rules[rule]?.default && rules[rule].required && !process.env[rule]) {
			throw new Error(`Environment variable ${rule} is required`);
		}
		if (
			rules[rule].validator &&
			!rules[rule].validator!(process.env[rule] as string)
		) {
			throw new Error(`Environment variable ${rule} is invalid`);
		}
	}
};
