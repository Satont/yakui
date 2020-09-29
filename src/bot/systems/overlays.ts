import cache from '@bot/libs/cache'
import variables from './variables'

export default new class Overlays {
  getOverlay(id: string) {
    return cache.overlays.get(id)
  }

  async parseOverlayData(id: string) {
    const overlay = cache.overlays.get(id)

    if (!overlay) throw `Overlay with ${id} not found.`

    return await variables.parseMessage({ message: overlay.data })
  }
}
