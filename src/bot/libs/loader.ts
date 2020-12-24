import { resolve } from 'path'
import getFiles from '@bot/commons/getFiles'
import { System } from 'typings'
import { error, info } from './logger'
import cache from './cache'

export const loadedSystems: System[] = []
export let loaded = false

const loader = async () => {
  const folders = {
    systems: 'System',
    integrations: 'Integration',
    customSystems: 'Custom System',
    libs: 'Lib',
    settings: 'Setting',
    overlays: 'Overlay',
  }
  for (const folder of Object.keys(folders)) {
    try {
      for await (const file of getFiles(resolve(__dirname, '..', folder))) {
        if (!file.endsWith('.js') && !file.endsWith('.ts')) continue
        if (file.endsWith('.d.ts')) continue
        if (file.includes('loader') || file.includes('cache')) continue

        const loadedFile: System = (await import(resolve(__dirname, '..', folder, file))).default
        if (!loadedFile) continue
        loadedSystems.push(loadedFile)
        if (loadedFile.socket) {
          loadedFile.socket.on('connection', client => {
            if (loadedFile.sockets) loadedFile.sockets(client)
            if (!loadedFile.clients) loadedFile.clients = []
            loadedFile.clients.push(client)
            client.on('disconnect', () => loadedFile.clients?.splice(loadedFile.clients?.indexOf(client), 1))
          })
        }

        info(`${folders[folder]} ${loadedFile.constructor.name.toUpperCase()} loaded`)
      }
    } catch (e) {
      error(e)
      continue
    }
  }
}

loader().then(async () => {
  for (const system of loadedSystems) {
    if (system.init) {
      await system.init()
    }
  }

  await cache.init()
  setTimeout(() => {
    loaded = true
  }, 5000)
})

