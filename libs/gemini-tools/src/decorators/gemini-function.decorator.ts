import { FunctionDeclaration } from '@google/generative-ai';
import {
  applyClassMetadata,
  applyMethodMetadata,
} from 'src/supports/decorator.support';
import { GeminiFunctionMetadataKey } from '../constants';

export const GeminiFunction = (declaration: FunctionDeclaration) =>
  applyMethodMetadata(declaration, GeminiFunctionMetadataKey);
