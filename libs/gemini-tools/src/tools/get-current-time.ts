import { FunctionDeclaration } from '@google/generative-ai';
import { GeminiFunction } from '../decorators/gemini-function.decorator';
import * as moment from 'moment';

import 'moment/locale/id';

const declaration: FunctionDeclaration = {
  name: 'getCurrentTime',
  description: 'ketika saya meminta waktu saat ini',
};

export class GetCurrentTime {
  @GeminiFunction(declaration)
  async execute() {
    return moment().format('LLLL');
  }
}
