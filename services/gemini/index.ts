import { Gemini } from "$services/gemini/gemini";

export const getResponseShio = async (text: string) => {
	const gemini = Gemini.make(Bun.env.GEMINI_KEY as string);
	gemini.setModel("gemini-2.0-flash-exp");

	const model = gemini.getModel()!;

	const response = await model.generateContent({
		systemInstruction:
			"kamu adalah orang yang paham shio, kamu akan menjelaskan shio kepadaku. berperanlah seperti manusia jangan seperti robot",
		generationConfig: {
			temperature: 1,
		},
		contents: [
			{
				role: "user",
				parts: [
					{
						text: "kamu adalah orang yang paham shio. dibawh ini adalah hasil shio nya, beritakan kepada saya",
					},
					{
						text: text,
					},
				],
			},
		],
	});

	return response.response.text();
};
