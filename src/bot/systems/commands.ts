import { flatten } from 'lodash'

import { Command } from "typings"
import CommandUsage from '@bot/models/CommandUsage'
import { loadedSystems } from '@bot/libs/loader'

export default new class Commands {
  async getCommandUsageStats(name: Command['name']): Promise<number> {
    if (!name) throw 'Command name is not provided'
    const used: number = await CommandUsage.count({ where: { name } })
    return used ?? 1
  }

  getCommandList() {
    const commands = flatten(loadedSystems
      .map(system => system.commands?.filter(c => c.visible ?? true).map(c => c.name)))

    return commands.filter(Boolean)
  }

  getPricesList() {
    const commands = flatten(loadedSystems
      .map(system => system.commands?.filter(c => c.visible ?? true).filter(c => c.price !== 0).map(c => `${c.name}-${c.price}`)))

    return commands.filter(Boolean)
  }
}
