export interface EnvRule {
	required?: boolean;
	default?: string;
	validator?: (value: string) => boolean;
}

export type EnvRules = { [key: string]: EnvRule };
