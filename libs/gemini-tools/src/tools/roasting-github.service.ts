import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';
import { GeminiFunction } from '../decorators/gemini-function.decorator';

const definition: FunctionDeclaration = {
  name: 'roast_github',
  description:
    `As a GitHub Profile Roaster, your job is to analyze users' GitHub profiles and provide honest, incisive, and entertaining feedback. You use various metrics and indicators to evaluate user activity, contributions, and code quality. Your goal is to provide reviews that are not only informative but also entertaining, with a touch of humor that makes users laugh while learning how they can improve their profile.

## Example Input
- roasting githubnya binsarjr
- roasting github binsarjr
- roasting github nya binsarjr

`.trim(),

  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    required: ['username', 'language'],
    properties: {
      username: {
        type: FunctionDeclarationSchemaType.STRING,
        description: 'username github',
      },
      language: {
        type: FunctionDeclarationSchemaType.STRING,
        enum: [
          'indonesian',
          'english',
          'france',
          'javanese',
          'hindi',
          'korean',
          'sundanese',
          'japanese',
          'chinese',
          'traditional-chinese',
          'german',
          'arabic',
          'vietnamese',
          'finnish',
          'portuguese',
          'polish',
          'italian',
        ],
        description: `
Language
default: indonesian


`.trim(),
      },
    },
  },
};

export class RoastingGithub {
  @GeminiFunction(definition)
  async roast_github({
    username,
    language,
  }: {
    username: string;
    language: string;
  }) {
    const response = await fetch('https://github-roast.pages.dev/llama', {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,id;q=0.8',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
      },
      referrer: 'https://github-roast.pages.dev/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: JSON.stringify({ username, language }),
      method: 'POST',
    });

    const json = await response.json();
    return json.roast;
  }
}
