import { prisma } from '../libs/db';
import { loadedSystems } from '../libs/loader';
import { Settings as SettingsModel } from '../entities/Settings';
import { cache, setupObserver } from './_observer';

export function SettingsDecorator(spaceName?: string) {
  return (clazz: any, name: string) => {
    setupObserver({ instance: clazz, propertyName: name, fromSettings: true });
    const space = spaceName || clazz.constructor.name.toLowerCase();
    const load = async () => {
      const module = loadedSystems.find((s) => s.constructor.name.toLowerCase() === space);
      if (!loadedSystems.length || !module) return setTimeout(() => load(), 1000);

      const item = await prisma.settings.findFirst({ where: { space, name } });

      if (!item) {
        await prisma.settings.create({ data: { space, name, value: module[name] } });
      } else module[name] = item.value;
    };
    load().then(() => {
      cache[space][name].settings.loaded = true;
    });
  };
}
