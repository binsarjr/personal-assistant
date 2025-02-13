import 'reflect-metadata';

export function Socket(
  target: any,
  propertyKey: string,
  parameterIndex: number,
) {
  const existingParameters: { [key: number]: 'socket' | 'baileys-context' } =
    Reflect.getMetadata('parameters', target, propertyKey) || {};

  existingParameters[parameterIndex] = 'socket';
  Reflect.defineMetadata('parameters', existingParameters, target, propertyKey);
}
