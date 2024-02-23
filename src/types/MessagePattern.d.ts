export type MessagePattern =
	| (RegExp | string | RegExp[] | string[])
	| true
	| false;
