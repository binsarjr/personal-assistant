import { type DownloadableMessage } from "@whiskeysockets/baileys";
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

	geminiMessageResponseIds: { [id: string]: number };

	messages: {
		[jid: string]: {
			[messageId: string]:
				| {
						type: "text";
						text: string;
						timestamp: number;
				  }
				| {
						type: "image" | "video";
						caption?: string;
						media: DownloadableMessage;
						timestamp: number;
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
