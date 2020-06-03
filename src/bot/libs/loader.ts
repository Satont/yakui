import { resolve } from 'path'
import getFiles from '../commons/getFiles'

const loader = async () => {
  for await (const file of getFiles(resolve(__dirname, '..', 'systems'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
    const loadedFile = await import(resolve(__dirname, '..', 'systems', file))

    if (typeof loadedFile.default.init !== 'undefined') await loadedFile.default.init()
    console.log(`System ${loadedFile.default.constructor.name.toUpperCase()} loaded`)
  }

  for await (const file of getFiles(resolve(__dirname, '..', 'customSystems'))) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

    const loadedFile = await import(resolve(__dirname, '..', 'customSystems', file))

    if (typeof loadedFile.default.init !== 'undefined') await loadedFile.default.init()
    console.log(`Custom System ${loadedFile.default.constructor.name.toUpperCase()} loaded`)
  }
}

loader()
