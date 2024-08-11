import {
  DiscoveredMethodWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { GeminiFunctionMetadataKey } from '../constants';
import {
  FunctionDeclaration,
  GenerateContentResult,
} from '@google/generative-ai';
import { Gemini } from '@services/gemini';

@Injectable()
export class GeminiFunctionService {
  constructor(private readonly discoverySerivce: DiscoveryService) {}

  /**
   * Inject Gemini Function
   * @param gemini Gemini instance
   */
  async injectGeminiFunction(gemini: Gemini) {
    const providers = await this.discoverySerivce.providerMethodsWithMetaAtKey(
      GeminiFunctionMetadataKey,
    );

    for (const provider of providers) {
      const meta = provider.meta as FunctionDeclaration;

      gemini.addFunctionCall(meta);
    }
  }

  /**
   * Call Gemini Function
   * @param geminiResult Gemini result
   */
  async callingFunction(geminiResult: GenerateContentResult) {
    const providers = await this.discoverySerivce.providerMethodsWithMetaAtKey(
      GeminiFunctionMetadataKey,
    );

    const geminiFunctionIncoming = geminiResult.response.functionCalls() || [];

    for (const provider of providers) {
      const instance = provider.discoveredMethod.parentClass
        .instance as DiscoveredMethodWithMeta<FunctionDeclaration>;
      const meta = provider.meta as FunctionDeclaration;

      for (const geminiFunction of geminiFunctionIncoming) {
        if (geminiFunction.name === meta.name) {
          return provider.discoveredMethod.handler.apply(instance, [
            geminiFunction.args,
          ]);
        }
      }
    }
  }
}
