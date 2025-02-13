import 'reflect-metadata';

export function Context(
  target: any,
  propertyKey: string,
  parameterIndex: number,
) {
  const existingParameters: { [key: number]: 'socket' | 'baileys-context' } =
    Reflect.getMetadata('parameters', target, propertyKey) || {};

  existingParameters[parameterIndex] = 'baileys-context';
  Reflect.defineMetadata('parameters', existingParameters, target, propertyKey);
}
