import cache from '@bot/libs/cache'
import { Command } from 'typings'

export default new class Commands {
  getCommands(): Command[] {
    return [...cache.commands.values()]
  }

  getCommandList() {
    return [...cache.commands.values()]
      .filter(c => c.visible ?? true)
      .map(c => c.name)
  }

  getPricesList() {
    const commands = [...cache.commands.values()]
      .filter(c => c.price !== 0)
      .map(c => ({ name: c.name, price: c.price }))

    return commands
  }

  getCommandById(id: string | number) {
    return this.getCommands().find(c => String(c.id) === String(id))
  }

  getCommandByName(name: string) {
    return cache.commands.get(name) || cache.commandsAliases.get(name)
  }
}
