import { Event } from '@bot/entities/Event';
import { Greeting } from '@bot/entities/Greeting';
import { Overlay } from '@bot/entities/Overlay';
import { Keyword } from '@bot/entities/Keyword';
import { Command, System } from 'typings';
import { loadedSystems } from './loader';
import { info } from './logger';
import { orm } from './db';

export default new class Cache {
  private _parsers: Map<string, { system: System, fnc: any }> = new Map()
  private _commands: Map<string, Command> = new Map()
  private _commandsAliases: Map<string, Command> = new Map()
  private _overlays: Map<string, Overlay> = new Map()
  private _events: Map<string, Event> = new Map()
  private _greetings: Map<string, Greeting> = new Map()
  private _keywords: Map<string, Keyword> = new Map()

  async init() {
    this.updateCommands();
    this.updateParsers();
    await this.updateOverlays();
    await this.updateEvents();
    await this.updateGreetings();
    await this.updateKeywords();
  }

  get parsers() {
    return new Map(this._parsers);
  }

  get commands() {
    return new Map(this._commands);
  }

  get commandsAliases() {
    return new Map(this._commandsAliases);
  }

  get overlays() {
    return new Map(this._overlays);
  }

  get events() {
    return new Map(this._events);
  }

  get greetings() {
    return new Map(this._greetings);
  }

  get keywords() {
    return new Map(this._keywords);
  }

  async updateCommands() {
    const locales = (await import('./locales')).default;
    this._commands.clear();

    for (const system of loadedSystems.filter(system => system.commands)) {
      system.commands.map(c => ({ ...c, system })).forEach(c => {
        c.description = c.description ? locales.translateWithNulled(c.description) ?? c.description : null;
        this._commands.set(c.name as string, c);
        c.aliases?.forEach(a => this._commandsAliases.set(a, c));
      });
    }

    info(`CACHE: Commands size: ${this._commands.size}, aliases size: ${this._commandsAliases.size}`);
  }

  updateParsers() {
    this._parsers.clear();

    for (const system of loadedSystems.filter(system => system.parsers)) {
      system.parsers.map(p => ({ ...p, system })).forEach(p => {
        this._parsers.set(system.constructor.name, p);
      });
    }
    info(`CACHE: Parsers size: ${this._parsers.size}`);
  }

  async updateOverlays() {
    this._overlays.clear();
    for (const overlay of await orm.em.fork().getRepository(Overlay).findAll()) {
      this._overlays.set(String(overlay.id), overlay);
    }

    info(`CACHE: Overlays size: ${this._overlays.size}`);
  }

  async updateEvents() {
    this._events.clear();

    for (const event of await orm.em.fork().getRepository(Event).findAll()) {
      this._events.set(event.name, event);
    }

    info(`CACHE: Events size: ${this._events.size}`);
  }

  async updateGreetings() {
    this._greetings.clear();

    for (const greeting of await orm.em.fork().getRepository(Greeting).findAll()) {
      this._greetings.set(String(greeting.id), greeting);
    }

    info(`CACHE: Greetings size: ${this._greetings.size}`);
  }

  async updateKeywords() {
    this._keywords.clear();

    for (const keyword of await orm.em.fork().getRepository(Keyword).findAll()) {
      this._keywords.set(String(keyword.id), keyword);
    }

    info(`CACHE: Keywords size: ${this._keywords.size}`);
  }
};
