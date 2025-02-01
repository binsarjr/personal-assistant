export function escapeRegex(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isExactMatchPattern(pattern: RegExp) {
	return (
		pattern.source.startsWith("^") &&
		pattern.source.endsWith("$") &&
		pattern.flags.includes("i")
	);
}

export function normalizePattern(pattern: string | RegExp): RegExp {
	if (typeof pattern === "string") {
		return new RegExp(`^${escapeRegex(pattern)}$`, "i");
	}
	return pattern;
}

export function getExactMatchKey(pattern: RegExp) {
	return pattern.source.replace(/^\^|\$|\/i$/g, "").toLowerCase();
}
