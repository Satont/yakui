import { resolve } from 'path'
import getFiles from '@bot/commons/getFiles'
import { System } from 'typings';
import { info } from './logger';

export const loadedSystems: System[] = []

const loader = async () => {
  for await (const file of getFiles(resolve(__dirname, '..', 'systems'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
    
    const loadedFile: System = (await import(resolve(__dirname, '..', 'systems', file))).default

    if (typeof loadedFile.init !== 'undefined') await loadedFile.init()
    if (typeof loadedFile.listenDbUpdates !== 'undefined') await loadedFile.listenDbUpdates()

    info(`System ${loadedFile.constructor.name.toUpperCase()} loaded`)
    loadedSystems.push(loadedFile)
  }

  for await (const file of getFiles(resolve(__dirname, '..', 'integrations'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
    
    const loadedFile: System = (await import(resolve(__dirname, '..', 'integrations', file))).default

    if (typeof loadedFile.init !== 'undefined') await loadedFile.init()
    if (typeof loadedFile.listenDbUpdates !== 'undefined') await loadedFile.listenDbUpdates()

    info(`Integration ${loadedFile.constructor.name.toUpperCase()} loaded`)
    loadedSystems.push(loadedFile)
  }

  for await (const file of getFiles(resolve(__dirname, '..', 'customSystems'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

    const loadedFile: System = (await import(resolve(__dirname, '..', 'customSystems', file))).default

    if (typeof loadedFile.init !== 'undefined') await loadedFile.init()
    if (typeof loadedFile.listenDbUpdates !== 'undefined') await loadedFile.listenDbUpdates()
    
    info(`Custom System ${loadedFile.constructor.name.toUpperCase()} loaded`)
    loadedSystems.push(loadedFile)
  }
}

loader()
