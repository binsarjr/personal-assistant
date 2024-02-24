import type { ENV_RULES } from "../configs/env.config.ts";

export interface Data {
	owner: string[];
	// for baileys auth store
	auths: { [sessionId: string]: any };
}

type EnvRulesDictionary = {
	[key in keyof typeof ENV_RULES]?: string | undefined;
};
declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvRulesDictionary {}
	}
}
