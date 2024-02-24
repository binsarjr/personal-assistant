import P from "pino";
import pretty from "pino-pretty";
const logger = P.default({ level: "debug" }, pretty.default());

export default logger;
