import { readFile } from "fs/promises";
import { glob } from "glob";
import { rootPath } from "../utils";

const prompts_file = {
	rule: rootPath("/prompt_ai/rule.md"),
	initial_information: rootPath("/prompt_ai/initial_information.md"),
};

export const getPromptRule = async () => {
	return (await readFile(prompts_file.rule, "utf-8")).toString();
};

export const getPromptInitialInformation = async () => {
	const prompt = (
		await readFile(prompts_file.initial_information, "utf-8")
	).toString();
	return (
		prompt +
		`
  
tanggal saat ini : ${new Date().toISOString().split("T")[0]}  
  
`
	);
};

export const initialPrompt = async () => {
	const prompts = await Promise.all([
		getPromptRule(),
		getPromptInitialInformation(),
		(async () => {
			return (
				await readFile(rootPath("/prompt_ai/default.md"), "utf-8")
			).toString();
		})(),
	]);

	const prompts_context = await glob(rootPath("/prompt_ai/context/**/*.md"));

	for (const file_context of prompts_context) {
		prompts.push((await readFile(file_context)).toString());
	}

	prompts.push(
		(await readFile(rootPath("/prompt_ai/end_of_prompt.md"))).toString()
	);
	return prompts;
};

export const createPrompt = async (prompt: string) => {
	return [...(await initialPrompt()), prompt].join("\n\n\n");
};
