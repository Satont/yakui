import { System } from 'typings'
import Overlay from '@bot/models/Overlay'
import variables from './variables'

export default new class Overlays implements System {
  overlays: Overlay[] = []

  async init() {
    const overlays: Overlay[] = await Overlay.findAll()

    this.overlays = overlays
  }

  getOverlay(id: number) {
    return this.overlays.find(o => o.id === id)
  }

  async parseOverlayData(id: number) {
    const overlay = this.overlays.find(o => o.id === id)

    if (!overlay) throw `Overlay with ${id} not found.`

    return await variables.parseMessage({ message: overlay.data })
  }
}
