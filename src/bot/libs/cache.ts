import { Event } from '@bot/entities/Event'
import { Greeting } from '@bot/entities/Greeting'
import { Overlay } from '@bot/entities/Overlay'
import { Keyword } from '@bot/entities/Keyword'
import { Command, System } from 'typings'
import { loadedSystems } from './loader'
import { info } from './logger'
import { orm } from './db'

export default new class Cache {
  parsers: Map<string, { system: System, fnc: any }> = new Map()
  commands: Map<string, Command> = new Map()
  commandsAliases: Map<string, Command> = new Map()
  overlays: Map<string, Overlay> = new Map()
  events: Map<string, Event> = new Map()
  greetings: Map<string, Greeting> = new Map()
  keywords: Map<string, Keyword> = new Map()

  async init() {
    this.updateCommands()
    this.updateParsers()
    await this.updateOverlays()
    await this.updateEvents()
    await this.updateGreetings()
    await this.updateKeywords()
  }

  async updateCommands() {
    const locales = (await import('./locales')).default
    this.commands = new Map()
    for (const system of loadedSystems.filter(system => system.commands)) {
      system.commands.map(c => ({ ...c, system })).forEach(c => {
        c.description = c.description ? locales.translateWithNulled(c.description) ?? c.description : null
        this.commands.set(c.name as string, c)
        c.aliases?.forEach(a => this.commandsAliases.set(a, c))
      })
    }

    info(`CACHE: Commands size: ${this.commands.size}, aliases size: ${this.commandsAliases.size}`)
  }

  updateParsers() {
    this.parsers = new Map()

    for (const system of loadedSystems.filter(system => system.parsers)) {
      system.parsers.map(p => ({ ...p, system })).forEach(p => {
        this.parsers.set(system.constructor.name, p)
      })
    }
    info(`CACHE: Parsers size: ${this.parsers.size}`)
  }

  async updateOverlays() {
    this.overlays = new Map()
    for (const overlay of await orm.em.fork().getRepository(Overlay).findAll()) {
      this.overlays.set(String(overlay.id), overlay)
    }

    info(`CACHE: Overlays size: ${this.overlays.size}`)
  }

  async updateEvents() {
    this.events = new Map()

    for (const event of await orm.em.fork().getRepository(Event).findAll()) {
      this.events.set(event.name, event)
    }

    info(`CACHE: Events size: ${this.events.size}`)
  }

  async updateGreetings() {
    this.greetings = new Map()

    for (const greeting of await orm.em.fork().getRepository(Greeting).findAll()) {
      this.greetings.set(String(greeting.id), greeting)
    }

    info(`CACHE: Greetings size: ${this.greetings.size}`)
  }

  async updateKeywords() {
    this.keywords = new Map()

    for (const keyword of await orm.em.fork().getRepository(Keyword).findAll()) {
      this.keywords.set(String(keyword.id), keyword)
    }

    info(`CACHE: Keywords size: ${this.keywords.size}`)
  }
}
