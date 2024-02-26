import type { ENV_RULES } from "../configs/env.config.ts";

export interface Data {
	// for baileys auth store
	auths: { [sessionId: string]: any };

	gemini: {
		[sessionId: string]: {
			[jid: string]: {
				active: boolean;
				rules: string[];
				history: {
					input?: string;
					output?: string;
					timestamp: number;
				}[];
			};
		};
	};
}

type EnvRulesDictionary = {
	[key in keyof typeof ENV_RULES]?: string | undefined;
};
declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvRulesDictionary {}
	}
}
