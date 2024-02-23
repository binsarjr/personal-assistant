import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";

const getKey = () => {
	const keys = (process.env.GEMINI_KEY || "").split(",");
	return keys[Math.floor(Math.random() * keys.length)];
};

const model = () => {
	const key = getKey();
	const genAI = new GoogleGenerativeAI(key);

	const model = genAI.getGenerativeModel({
		model: "gemini-pro",
		generationConfig: {
			temperature: 1,
		},
		safetySettings: [
			{
				category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
				threshold: HarmBlockThreshold.BLOCK_NONE,
			},
			{
				category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
				threshold: HarmBlockThreshold.BLOCK_NONE,
			},
			{
				category: HarmCategory.HARM_CATEGORY_HARASSMENT,
				threshold: HarmBlockThreshold.BLOCK_NONE,
			},
			{
				category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
				threshold: HarmBlockThreshold.BLOCK_NONE,
			},
		],
	});

	return model;
};

// harus seperti ini untuk mengaktifkan random getkey nya
export const gemini = () => model();
