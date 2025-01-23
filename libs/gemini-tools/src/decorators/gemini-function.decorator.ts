import { FunctionDeclaration } from '@google/generative-ai';
import { applyMethodMetadata } from 'src/supports/decorator.support';
import { GeminiFunctionMetadataKey } from '../constants';

export const GeminiFunction = (declaration: FunctionDeclaration) =>
  applyMethodMetadata(declaration, GeminiFunctionMetadataKey);
