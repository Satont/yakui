import { resolve } from 'path'
import getFiles from '../commons/getFiles'
import { System } from '../../../typings';

export const loadedSystems: System[] = []

const loader = async () => {
  for await (const file of getFiles(resolve(__dirname, '..', 'systems'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
    
    const loadedFile: System = (await import(resolve(__dirname, '..', 'systems', file))).default

    if (typeof loadedFile.init !== 'undefined') await loadedFile.init()
    if (typeof loadedFile.listenDbUpdates !== 'undefined') await loadedFile.listenDbUpdates()

    console.log(`System ${loadedFile.constructor.name.toUpperCase()} loaded`)
    loadedSystems.push(loadedFile)
  }

  for await (const file of getFiles(resolve(__dirname, '..', 'customSystems'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

    const loadedFile: System = (await import(resolve(__dirname, '..', 'customSystems', file))).default

    if (typeof loadedFile.init !== 'undefined') await loadedFile.init()
    if (typeof loadedFile.listenDbUpdates !== 'undefined') await loadedFile.listenDbUpdates()
    
    console.log(`Custom System ${loadedFile.constructor.name.toUpperCase()} loaded`)
    loadedSystems.push(loadedFile)
  }
}

loader()
