import { System, Command } from 'typings';

export function command(opts: Command): MethodDecorator {
  return (instance: System, methodName: string): void => {
    if (!instance.commands) instance.commands = [];
    const data = { ...opts, fnc: methodName };

    instance.commands.push(data);
  };
}
