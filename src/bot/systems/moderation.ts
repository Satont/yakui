import { System, CommandOptions, ParserOptions, UserPermissions } from 'typings';
import tmi from '@bot/libs/tmi';
import users from './users';
import { settings } from '../decorators';
import { parser } from '../decorators/parser';
import { command } from '../decorators/command';
import { link } from '@satont/text-utils';
import { CommandPermission } from '@prisma/client';

const symbolsRegexp = /([^\s\u0500-\u052F\u0400-\u04FF\w]+)/g;

class Moderation implements System {
  permits: string[] = [];
  warnings: Warnings = {
    links: [],
    blacklist: [],
    symbols: [],
    longMessage: [],
    caps: [],
    color: [],
    emotes: [],
  };

  @settings()
    enabled = false;

  @settings()
    links: ILinks = {
      enabled: false,
      subscribers: false,
      vips: false,
      clips: false,
      timeout: {
        time: 600,
        message: 'links disallowed',
      },
      warning: {
        time: 1,
        message: 'links disallowed [warn]',
      },
    };

  @settings()
    blacklist: IBlackList = {
      enabled: false,
      subscribers: false,
      vips: false,
      values: [],
      timeout: {
        time: 600,
        message: 'some word in blacklist',
      },
      warning: {
        time: 1,
        message: 'some word in blacklist [warn]',
      },
    };

  @settings()
    symbols: ISymbols = {
      enabled: false,
      subscribers: false,
      vips: false,
      trigger: {
        length: 15,
        percent: 50,
      },
      timeout: {
        time: 600,
        message: 'so much symbols',
      },
      warning: {
        time: 1,
        message: 'so much symbols [warn]',
      },
    };

  @settings()
    longMessage: ILongMessage = {
      enabled: false,
      subscribers: false,
      vips: false,
      trigger: {
        length: 15,
      },
      timeout: {
        time: 600,
        message: 'so long message',
      },
      warning: {
        time: 1,
        message: 'so long message [warn]',
      },
    };

  @settings()
    caps: ICaps = {
      enabled: false,
      subscribers: false,
      vips: false,
      trigger: {
        length: 15,
        percent: 50,
      },
      timeout: {
        time: 600,
        message: 'caps disallowed',
      },
      warning: {
        time: 1,
        message: 'caps disallowed [warn]',
      },
    };

  @settings()
    emotes: IEmotes = {
      enabled: false,
      subscribers: false,
      vips: false,
      trigger: {
        length: 10,
      },
      timeout: {
        time: 600,
        message: 'so much emotes',
      },
      warning: {
        time: 1,
        message: 'so much emotes [warn]',
      },
    };

  @settings()
    color = {
      enabled: false,
      subscribers: false,
      vips: false,
      timeout: {
        time: 600,
        message: 'colored messages disallowed',
      },
      warning: {
        time: 1,
        message: 'colored messages disallowed [warn]',
      },
    };

  onStreamEnd() {
    for (const [type] of Object.entries(this.warnings)) this.warnings[type] = [];
  }

  onStreamStart() {
    for (const [type] of Object.entries(this.warnings)) this.warnings[type] = [];
  }

  private doesWarned({ type, username }: { type: keyof Warnings; username: string }) {
    return this.warnings[type].includes(username.toLowerCase());
  }
  private removeFromWarned({ type, username }: { type: keyof Warnings; username: string }) {
    this.warnings[type].splice(this.warnings[type].indexOf(username.toLowerCase()), 1);
  }

  @command({
    name: 'permit',
    permission: CommandPermission.MODERATORS,
    visible: false,
    description: 'commands.permit.description',
  })
  async permit(opts: CommandOptions) {
    this.permits.push(opts.argument.trim());

    return `$sender permit added for ${opts.argument}`;
  }

  @parser()
  async parse(opts: ParserOptions) {
    if (!this.enabled) return false;
    const userPermissions = users.getUserPermissions(opts.raw.userInfo.badges, opts.raw);
    if (userPermissions.BROADCASTER || userPermissions.MODERATORS) return false;
    if (await this.blacklistParser(opts, userPermissions)) return true;
    if (await this.linksParser(opts, userPermissions)) return true;
    if (await this.symbolsParser(opts, userPermissions)) return true;
    if (await this.longMessageParser(opts, userPermissions)) return true;
    if (await this.capsParser(opts, userPermissions)) return true;
    //if (await this.color(opts, userPermissions)) return true
    if (await this.emotesParser(opts, userPermissions)) return true;
  }

  async linksParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.links;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;
    const message = opts.message;

    if (!link.length(message)) return false;
    if (!settings.clips && (/.*(clips.twitch.tv\/)(\w+)/g.test(opts.message) || /.*(www.twitch.tv\/\w+\/clip\/)(\w+)/g.test(opts.message)))
      return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'links';

    if (this.permits.includes(username)) {
      this.removeFromWarned({ type, username });
      return false;
    }

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });

      this.removeFromWarned({ type, username });
      return true;
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
      this.warnings[type].push(username);
      return true;
    }
  }
  async symbolsParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.symbols;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;

    if (opts.message.length < settings.trigger.length) return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'symbols';

    const matched = opts.message.match(symbolsRegexp);
    let symbols = 0;

    for (const item in matched) {
      if (matched[item]) {
        const temp = matched[item];
        symbols = symbols + temp.length;
      }
    }

    const check = Math.ceil(symbols / opts.message.length / 100) >= settings.trigger.percent;

    if (!check) return false;

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });

      this.removeFromWarned({ type, username });
      return true;
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
      this.warnings[type].push(username);
      return true;
    }
  }

  async longMessageParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.longMessage;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;

    if (opts.message.length < settings.trigger.length) return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'longMessage';

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });

      this.removeFromWarned({ type, username });
      return true;
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
      this.warnings[type].push(username);
      return true;
    }
  }

  async capsParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.caps;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'caps';
    let message = opts.message;

    let capsLength = 0;

    for (const emote of opts.raw.parseEmotes().filter((o) => o.type === 'emote')) {
      message = message.replace(emote['name'], '').trim();
    }

    if (message.length < settings.trigger.length) return false;

    for (let i = 0; i < message.length; i++) {
      if (message.charAt(i) == message.charAt(i).toUpperCase()) {
        capsLength += 1;
      }
    }

    const check = Math.ceil(capsLength / (message.length / 100)) >= settings.trigger.percent;

    if (!check) return false;

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });

      this.removeFromWarned({ type, username });
      return true;
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
      this.warnings[type].push(username);
      return true;
    }
  }

  async emotesParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.emotes;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'emotes';
    const emotesLength = opts.raw.parseEmotes().filter((o) => o.type === 'emote').length;

    if (emotesLength < settings.trigger.length) return false;

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });

      this.removeFromWarned({ type, username });
      return true;
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
      this.warnings[type].push(username);
      return true;
    }
  }

  async colorParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.color;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'color';

    if ((opts.raw as any).isAction) return false;

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });

      this.removeFromWarned({ type, username });
      return true;
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
      this.warnings[type].push(username);
      return true;
    }
  }

  async blacklistParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.blacklist;

    if (!settings?.enabled) return false;
    if (!settings?.subscribers && permissions.SUBSCRIBERS) return false;
    if (!settings?.vips && permissions.VIPS) return false;

    const username = opts.raw.userInfo.userName.toLowerCase();
    const type = 'blacklist';
    let result = false;

    for (const value of settings.values) {
      if (value === '') continue;
      if (!opts.message.includes(value)) continue;

      if (this.doesWarned({ type, username })) {
        tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message });
        this.removeFromWarned({ type, username });
      } else {
        tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message });
        this.warnings[type].push(username);
      }

      result = true;
      break;
    }

    return result;
  }
}

export default new Moderation();

export interface Warnings {
  [x: string]: string[];
}

export interface ITimeoutWarning {
  time: number;
  message: string;
}

export interface IDefaultSettings {
  enabled: boolean;
  subscribers: boolean;
  vips: boolean;
  timeout: ITimeoutWarning;
  warning: ITimeoutWarning;
}

export interface ILinks extends IDefaultSettings {
  clips: boolean;
}

export interface ISymbols extends IDefaultSettings {
  trigger: {
    length: number;
    percent: number;
  };
}

export interface ILongMessage extends IDefaultSettings {
  trigger: {
    length: number;
  };
}

export interface ICaps extends IDefaultSettings {
  trigger: {
    length: number;
    percent: number;
  };
}

export interface IEmotes extends IDefaultSettings {
  trigger: {
    length: number;
  };
}

export interface IBlackList extends IDefaultSettings {
  values: string[];
}
