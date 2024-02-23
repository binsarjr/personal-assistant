import P from "pino";
import pretty from "pino-pretty";
const logger = P.default(pretty.default());

export default logger;
