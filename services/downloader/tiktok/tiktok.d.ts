export type TiktokDlResult =
	| {
			caption: string;
			video?: string;
			slides?: string[];
			audio?: string;
	  }
	| undefined
	| null;
