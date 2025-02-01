import P from "pino";

const logger = P({
	timestamp: () => `,"time":"${new Date().toJSON()}"`,

	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});
logger.level = "trace";

export { logger };
