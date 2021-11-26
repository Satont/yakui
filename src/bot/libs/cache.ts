/* eslint-disable @typescript-eslint/indent */
import { Command, System } from 'typings';
import { loadedSystems } from './loader';
import { info } from './logger';
import { prisma } from './db';
import { Events, Files, Greetings, Keywords, Overlays, Quotes } from '@prisma/client';

class Cache {
  private _parsers: Map<string, { system: System; fnc: any }> = new Map();
  private _commands: Map<string, Command> = new Map();
  private _commandsAliases: Map<string, Command> = new Map();
  private _overlays: Map<string, Overlays> = new Map();
  private _events: Map<string, Events> = new Map();
  private _greetings: Map<
    string,
    Greetings & {
      sound_file: Files;
    }
  > = new Map();
  private _keywords: Map<string, Keywords> = new Map();
  private _quotes: Map<string, Quotes> = new Map();

  async init() {
    this.updateCommands();
    this.updateParsers();
    await this.updateOverlays();
    await this.updateEvents();
    await this.updateGreetings();
    await this.updateKeywords();
    await this.updateQuotes();
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

  get quotes() {
    return new Map(this._quotes);
  }

  async updateCommands() {
    const locales = (await import('./locales')).default;
    this._commands.clear();

    for (const system of loadedSystems.filter((system) => system.commands)) {
      system.commands
        .map((c) => ({ ...c, system }))
        .forEach((c) => {
          c.description = c.description ? locales.translateWithNulled(c.description) ?? c.description : null;
          this._commands.set(c.name as string, c);
          c.aliases?.forEach((a) => this._commandsAliases.set(a, c));
        });
    }

    info(`CACHE: Commands size: ${this._commands.size}, aliases size: ${this._commandsAliases.size}`);
  }

  updateParsers() {
    this._parsers.clear();

    for (const system of loadedSystems.filter((system) => system.parsers)) {
      system.parsers
        .map((p) => ({ ...p, system }))
        .forEach((p) => {
          this._parsers.set(system.constructor.name, p);
        });
    }
    info(`CACHE: Parsers size: ${this._parsers.size}`);
  }

  async updateOverlays() {
    this._overlays.clear();
    for (const overlay of await prisma.overlays.findMany()) {
      this._overlays.set(String(overlay.id), overlay);
    }

    info(`CACHE: Overlays size: ${this._overlays.size}`);
  }

  async updateEvents() {
    this._events.clear();

    for (const event of await prisma.events.findMany()) {
      this._events.set(event.name, event);
    }

    info(`CACHE: Events size: ${this._events.size}`);
  }

  async updateGreetings() {
    this._greetings.clear();

    for (const greeting of await prisma.greetings.findMany({
      include: {
        sound_file: true,
      },
    })) {
      this._greetings.set(String(greeting.id), greeting);
    }

    info(`CACHE: Greetings size: ${this._greetings.size}`);
  }

  async updateKeywords() {
    this._keywords.clear();

    for (const keyword of await prisma.keywords.findMany()) {
      this._keywords.set(String(keyword.id), keyword);
    }

    info(`CACHE: Keywords size: ${this._keywords.size}`);
  }

  async updateQuotes() {
    this._quotes.clear();

    for (const quote of await prisma.quotes.findMany()) {
      this._quotes.set(String(quote.id), quote);
    }

    info(`CACHE: Quotes size: ${this._quotes.size}`);
  }
}

export default new Cache();
