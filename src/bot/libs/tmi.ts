import { ApiClient, RefreshableAuthProvider } from 'twitch';
import { ChatClient as Chat } from 'twitch-chat-client';
import { StaticAuthProvider } from 'twitch-auth';

import Parser from './parser';
import events from '@bot/systems/events';
import { info, error, chatOut, chatIn, timeout, whisperOut } from './logger';
import { onHosting, onHosted, onRaided, onSubscribe, onReSubscribe, onMessageHighlight } from './eventsCaller';
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';
import oauth from './oauth';

class Tmi {
  bot: {
    api: ApiClient | null;
    chat: Chat | null;
    auth: RefreshableAuthProvider;
  } = {
    chat: null,
    api: null,
    auth: null,
  };

  broadcaster: {
    api: ApiClient | null;
    chat: Chat | null;
    auth: RefreshableAuthProvider;
  } = {
    chat: null,
    api: null,
    auth: null,
  };

  channel: { name: string; id: string };
  parsedLinesPerStream = 0;

  async connect(type: 'bot' | 'broadcaster') {
    if (!oauth.clientId || !oauth.clientSecret || !oauth[`${type}RefreshToken`]) {
      return;
    }

    info(`TMI: Starting initiliaze ${type} client`);

    try {
      await this.disconnect(type);

      const staticProvider = new StaticAuthProvider(oauth.clientId);
      this[type].auth = new RefreshableAuthProvider(staticProvider as any, {
        clientSecret: oauth.clientSecret,
        refreshToken: oauth[`${type}RefreshToken`],
        onRefresh: async ({ accessToken, refreshToken }) => {
          oauth[`${type}AccessToken`] = accessToken;
          oauth[`${type}RefreshToken`] = refreshToken;
        },
      });

      this[type].api = new ApiClient({ authProvider: this[type].auth });

      if (type === 'bot') {
        await this.getChannel(oauth.channel);
        await this.loadLibs();
      } else {
        await (await import('./pubsub')).default.init();
      }

      if (!this.channel) return;
      this[type].chat = new Chat(this[type].auth as any, { channels: [this.channel.name] });
      this.listeners(type);
      await this[type].chat.connect();
    } catch (e) {
      error(e);
    }
  }

  private async getChannel(name: string) {
    const user = await this.bot?.api.helix.users.getUserByName(name);
    if (!user) return;
    this.channel = { name: user.name, id: user.id };

    info(`TMI: Channel name: ${this.channel.name}, channelId: ${this.channel.id}`);
  }

  async disconnect(type: 'bot' | 'broadcaster') {
    const client = this[type].chat;

    if (client && this.channel) {
      client.part(this.channel.name);
      client.quit();

      this[type].chat = null;
      this[type].api = null;
    }
  }

  async listeners(type: 'bot' | 'broadcaster') {
    const client = this[type].chat;

    client.onDisconnect((manually, reason) => {
      if (!manually) {
        info(`TMI: ${type} disconnected from server ${reason}`);
        this.connect(type);
      }
    });

    client.onConnect(async () => {
      info(`TMI: ${type.charAt(0).toUpperCase() + type.substring(1)} client connected`);
    });

    client.onJoin((channel) => {
      info(`TMI: ${type} joined ${channel.replace('#', '')}`);
    });

    client.onPart((channel) => {
      info(`TMI: ${type} parted ${channel.replace('#', '')}`);
    });

    if (type === 'bot') {
      client.onAnyMessage((msg) => {
        this.parsedLinesPerStream++;
        if (msg.tags.get('msg-id') !== 'highlighted-message') return;
        onMessageHighlight(msg as TwitchPrivateMessage);
      });
      client.onAction(async (channel, username, message, raw) => {
        chatIn(`${username} [${raw.userInfo.userId}]: ${message}`);

        (raw as any).isAction = true;
        events.fire({ name: 'message', opts: { username, message } });
        Parser.parse(message, raw);
      });
      client.onMessage(async (channel, username, message, raw) => {
        chatIn(`${username} [${raw.userInfo.userId}]: ${message}`);

        if (raw.isCheer) {
          events.fire({ name: 'bits', opts: { amount: raw.totalBits, message } });
        } else {
          events.fire({ name: 'message', opts: { username, message } });
          Parser.parse(message, raw);
        }
      });
      client.onHost((channel, username, viewers) => {
        onHosting({ username, viewers });
      });
      client.onHosted((channel, username, auto, viewers) => {
        onHosted({ username, viewers });
      });
      client.onRaid((channel, username, { viewerCount }) => {
        onRaided({ username, viewers: viewerCount });
      });
      client.onSub((channel, username, subInfo) => {
        const tier = isNaN(Number(subInfo.plan)) ? 'Twitch prime' : String(Number(subInfo.plan) / 1000);
        onSubscribe({ username, tier, isPrime: subInfo.isPrime, message: subInfo.message });
      });
      client.onResub((channel, username, subInfo) => {
        const tier = isNaN(Number(subInfo.plan)) ? 'Twitch prime' : String(Number(subInfo.plan) / 1000);
        onReSubscribe({
          username,
          tier,
          message: subInfo.message,
          months: subInfo.streak,
          overallMonths: subInfo.months,
          isPrime: subInfo.isPrime,
        });
      });
    }
  }

  private splitLine(input: string, length: number) {
    if (input.length < length) {
      return [input];
    }

    let lastSpace = input.substring(0, length).lastIndexOf(' ');

    if (lastSpace === -1) {
      lastSpace = length - 1;
    }

    return [input.substring(0, lastSpace), input.substring(lastSpace + 1)];
  }

  async say({ type = 'bot', message }: { type?: 'bot' | 'broadcaster'; message: string }) {
    if (process.env.NODE_ENV === 'production') {
      const messages = this.splitLine(message, 500);
      for (const msg of messages) {
        this[type].chat?.say(this.channel.name, msg);
      }
    }
    chatOut(message);
  }

  async timeout({ username, duration, reason }: { username: string; duration: number; reason?: string }) {
    if (process.env.NODE_ENV === 'production') await this.bot.chat?.timeout(this.channel.name, username, duration, reason);
    timeout(`${username} | ${duration}s | ${reason ?? ''}`);
  }

  async whispers({ type = 'bot', message, target }: { type?: 'bot' | 'broadcaster'; message: string; target: string }) {
    if (process.env.NODE_ENV === 'production') this[type].chat?.whisper(target, message);
    whisperOut(`${target}: ${message}`);
  }

  private async loadLibs() {
    await import('./loader');
    await import('./currency');
  }
}

export default new Tmi();
