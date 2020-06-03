import { loadedSystems } from './loader'

export const onStreamStart = () => {
  for (const system of loadedSystems) {
    if (typeof system.onStreamStart === 'function') system.onStreamStart()
  }
}

export const onStreamEnd = () => {
  for (const system of loadedSystems) {
    if (typeof system.onStreamEnd === 'function') system.onStreamEnd()
  }
}