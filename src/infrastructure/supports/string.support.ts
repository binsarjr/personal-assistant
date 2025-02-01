export function replaceRandomSpacesToUnicode(input: string): string {
	let probability = Math.random() * (0.7 - 0.3) + 0.3;
	let unicode = `‎`;
	return input
		.split("")
		.map((char) => {
			if (char === " " && Math.random() < probability) {
				return unicode;
			}
			return char;
		})
		.join("");
}
