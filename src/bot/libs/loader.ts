import { resolve } from 'path'
import getFiles from '@bot/commons/getFiles'
import { System } from 'typings'
import { error, info } from './logger'
import cache from './cache'

export const loadedSystems: System[] = []

const loader = async () => {
  const folders = {
    systems: 'System',
    integrations: 'Integration',
    customSystems: 'Custom System',
    overlays: 'Overlay',
  }
  for (const folder of Object.keys(folders)) {
    try {
      for await (const file of getFiles(resolve(__dirname, '..', folder))) {
        if (!file.endsWith('.js') && !file.endsWith('.ts')) continue
  
        const loadedFile: System = (await import(resolve(__dirname, '..', folder, file))).default
        if (typeof loadedFile.init !== 'undefined') await loadedFile.init()
        if (typeof loadedFile.listenDbUpdates !== 'undefined') await loadedFile.listenDbUpdates()
        if (typeof loadedFile.sockets !== 'undefined' && loadedFile.socket) {
          loadedFile.socket.on('connection', client => loadedFile.sockets(client))
        }
  
        info(`${folders[folder]} ${loadedFile.constructor.name.toUpperCase()} loaded`)
        loadedSystems.push(loadedFile)
      }
    } catch (e) {
      error('LOADER: ' + e)
      continue
    } 
  }
}

loader().then(async () => {
  await cache.init()
})
