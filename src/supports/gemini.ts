import { GoogleGenerativeAI } from "@google/generative-ai";

const getKey = () => {
	const keys = (process.env.GEMINI_KEY || "").split(",");
	return keys[Math.floor(Math.random() * keys.length)];
};

const model = () => {
	const key = getKey();
	const genAI = new GoogleGenerativeAI(key);

	const model = genAI.getGenerativeModel({ model: "gemini-pro" });

	return model;
};

// harus seperti ini untuk mengaktifkan random getkey nya
export const gemini = () => model();
