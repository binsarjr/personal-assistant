import {
  Content,
  FunctionCallingMode,
  FunctionDeclarationSchemaType,
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

export type GenerativeModelName =
  | 'gemini-pro-vision'
  | 'gemini-pro'
  | 'gemini-1.5-flash-latest'
  | 'gemini-1.5-flash';

export class Gemini {
  protected systemInstruction?: string;
  protected modelName?: GenerativeModelName;
  protected model?: GenerativeModel;
  protected prompts?: Content[] = [];
  constructor(private readonly gemini: GoogleGenerativeAI) {}

  public static make(apiKey?: string): Gemini {
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || '';
      const apiKeys = apiKey.split(',');
      apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    }
    return new Gemini(new GoogleGenerativeAI(apiKey));
  }

  public setModel(model: GenerativeModelName) {
    this.modelName = model;

    this.model = this.gemini.getGenerativeModel({
      model: model,
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
      generationConfig: {
        temperature: 0.4,
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: 'getCurrentTime',
              description: 'ketika saya meminta waktu saat ini',
            },
            {
              name: 'github_roaster',
              description:
                'Ketika ada yang meminta untuk meroasting github profile',
              parameters: {
                type: FunctionDeclarationSchemaType.OBJECT,
                description: 'username dan language',
                required: ['username', 'language'],
                properties: {
                  username: {
                    type: FunctionDeclarationSchemaType.STRING,
                    description: 'username',
                  },
                  language: {
                    type: FunctionDeclarationSchemaType.STRING,
                    description: `
Language
default: indonesian
supported: english,france,indonesian,javanese,hindi,korean,sundanese,japanese,chinese,traditional-chinese,german,arabic,vietnamese,finnish,portuguese,polish,italian


`.trim(),
                  },
                },
              },
            },
          ],
        },
      ],
      // toolConfig: {
      //
      //   // functionCallingConfig: {
      //   //   allowedFunctionNames: ['get_current_time'],
      //   // },
      // },
    });
    return this;
  }

  public async setSystemInstruction(instruction: string) {
    this.systemInstruction = instruction;
    return this;
  }

  public addContent(content: Content) {
    this.prompts.push(content);
    return this;
  }

  public async generate() {
    if (!this.model) throw new Error('Model not set');

    return await this.model.generateContent({
      systemInstruction: this.systemInstruction,
      contents: this.prompts,
    });
  }
}
