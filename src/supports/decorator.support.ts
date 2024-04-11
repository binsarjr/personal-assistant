export const applyMethodMetadata = (
  options: any,
  metadataKey: string,
): MethodDecorator => {
  return (
    _target: Record<string, any>,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(metadataKey, options, descriptor.value);
    return descriptor;
  };
};

export const applyClassMetadata = (
  options: any,
  metadataKey: string,
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(metadataKey, options, target);
    return target;
  };
};
