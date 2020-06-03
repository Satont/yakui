import { loadedSystems } from './loader'

export const onStreamStart = () => {
  console.info(`TWITCH: Stream started`)
  for (const system of loadedSystems) {
    if (typeof system.onStreamStart === 'function') system.onStreamStart()
  }
}

export const onStreamEnd = () => {
  console.info(`TWITCH: Stream ended`)
  for (const system of loadedSystems) {
    if (typeof system.onStreamEnd === 'function') system.onStreamEnd()
  }
}