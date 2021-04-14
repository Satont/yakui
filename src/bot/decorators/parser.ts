import { System } from 'typings';

export function parser(name?: string): MethodDecorator {
  return (instance: System, methodName: string): void => {
    if (!instance.parsers) instance.parsers = [];

    instance.parsers.push({ name, fnc: methodName });
  };
}
