import type { ENV_RULES } from "../configs/env.config.ts";

export interface Data {
	owner: string[];
}

type EnvRulesDictionary = {
	[key in keyof typeof ENV_RULES]?: string | undefined;
};
declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvRulesDictionary {}
	}
}
