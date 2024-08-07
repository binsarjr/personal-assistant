import {
  Content,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

export type GenerativeModelName =
  | 'gemini-pro-vision'
  | 'gemini-pro'
  | 'gemini-1.5-flash';

export class Gemini {
  protected systemInstruction?: string;
  protected modelName?: GenerativeModelName;
  protected model?: GenerativeModel;
  protected prompts?: Content[] = [];
  constructor(private readonly gemini: GoogleGenerativeAI) {}

  public static make(apiKey?: string): Gemini {
    return new Gemini(
      new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY!),
    );
  }

  public setModel(model: GenerativeModelName) {
    this.modelName = model;

    this.model = this.gemini.getGenerativeModel({
      model: model,
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
