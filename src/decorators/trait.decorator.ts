// trait.decorator.ts
import 'reflect-metadata';

export function Trait(traitClass: new (...args: any[]) => any) {
  return function (target: any) {
    Object.getOwnPropertyNames(traitClass.prototype).forEach((name) => {
      if (name !== 'constructor') {
        const descriptor = Object.getOwnPropertyDescriptor(
          traitClass.prototype,
          name,
        );
        Object.defineProperty(target.prototype, name, descriptor);
      }
    });
  };
}

export const TraitEligible = Trait;
