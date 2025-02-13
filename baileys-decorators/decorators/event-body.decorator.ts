import 'reflect-metadata';

export function EventBody(
  target: any,
  propertyKey: string,
  parameterIndex: number,
) {
  const parameterNames = Reflect.getMetadata(
    'design:paramtypes',
    target,
    propertyKey,
  ).map((t: any) => t.name);
  const parameterName = parameterNames[parameterIndex];

  const existingParameters: { [key: string]: 'socket' | 'eventBody' } =
    Reflect.getMetadata('parameters', target, propertyKey) || {};
  existingParameters[parameterName] = 'eventBody';
  Reflect.defineMetadata('parameters', existingParameters, target, propertyKey);
}
