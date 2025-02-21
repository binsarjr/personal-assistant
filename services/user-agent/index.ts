import { join } from "path";

const contents = await Bun.file(join(__dirname, "user-agents.txt")).text();

const userAgents = contents.split("\n").filter(Boolean);

export const getRandomUserAgent = () => {
	const index = Math.floor(Math.random() * userAgents.length);
	return userAgents[index] + "" + Math.random() * 100;
};
