import Event from '@bot/models/Event'
import Greeting from '@bot/models/Greeting'
import Overlay from '@bot/models/Overlay'
import Keyword from '@bot/models/Keyword'
import { Command, System } from 'typings'
import { loadedSystems } from './loader'
import { info } from './logger'

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

  updateCommands() {
    this.commands = new Map()
    for (const system of loadedSystems.filter(system => system.commands)) {
      system.commands.map(c => ({ ...c, system })).forEach(c => {
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

    info(`CACHE: Parsers size: ${this.commands.size}`)
  }

  async updateOverlays() {
    this.overlays = new Map()
    for (const overlay of await Overlay.findAll() as Overlay[]) {
      this.overlays.set(String(overlay.id), overlay)
    }

    info(`CACHE: Overlays size: ${this.overlays.size}`)
  }

  async updateEvents() {
    this.events = new Map()

    for (const event of await Event.findAll() as Event[]) {
      this.events.set(event.name, event)
    }

    info(`CACHE: Events size: ${this.events.size}`)
  }

  async updateGreetings() {
    this.greetings = new Map()

    for (const greeting of await Greeting.findAll() as Greeting[]) {
      this.greetings.set(String(greeting.id), greeting)
    }

    info(`CACHE: Greetings size: ${this.events.size}`)
  }

  async updateKeywords() {
    this.keywords = new Map()

    for (const keyword of await Keyword.findAll() as Keyword[]) {
      this.keywords.set(String(keyword.id), keyword)
    }

    info(`CACHE: Keywords size: ${this.events.size}`)
  }
}
