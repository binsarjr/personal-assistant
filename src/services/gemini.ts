import {
  Content,
  FunctionDeclaration,
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

export type GenerativeModelName =
  | 'gemini-pro-vision'
  | 'gemini-pro'
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-flash-latest'
  | 'gemini-1.5-flash';

export class Gemini {
  protected systemInstruction?: string;
  protected modelName?: GenerativeModelName;
  protected model?: GenerativeModel;
  protected prompts?: Content[] = [];
  protected __functionCalls: FunctionDeclaration[] = [];
  constructor(private readonly gemini: GoogleGenerativeAI) {}

  public static make(apiKey?: string): Gemini {
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || '';
      const apiKeys = apiKey.split(',');
      apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    }
    return new Gemini(new GoogleGenerativeAI(apiKey));
  }

  public addFunctionCall(functionCall: FunctionDeclaration) {
    this.__functionCalls.push(functionCall);
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

  public async generate(inJson = false) {
    if (!this.model) throw new Error('Model not set');

    return await this.model.generateContent({
      systemInstruction: this.systemInstruction,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        responseMimeType: inJson ? 'application/json' : 'text/plain',
      },
      contents: this.prompts,
      tools: [
        {
          functionDeclarations: this.__functionCalls,
        },
      ],
    });
  }
}
