import safeEval from 'safe-eval';
import { get } from 'lodash';

import tmi from '@bot/libs/tmi';
import { System, DonationData, HostType } from 'typings';
import { INewResubscriber, INewSubscriber } from 'typings/events';
import { getNameSpace } from '@bot/libs/socket';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client/lib';
import alerts from '@bot/overlays/alerts';
import tts from '@bot/overlays/tts';
import cache from '@bot/libs/cache';
import { prisma } from '@bot/libs/db';
import { EventSubChannelFollowEvent } from 'twitch-eventsub/lib/Events/EventSubChannelFollowEvent';
import { EventSubChannelModeratorEvent } from 'twitch-eventsub/lib/Events/EventSubChannelModeratorEvent';

class Events implements System {
  socket = getNameSpace('widgets/eventlist');
  clients: SocketIO.Socket[] = [];

  async fire({ name, opts }: { name: string; opts: Record<string, string | number | Record<string, unknown>>}) {
    const event = cache.events.get(name);
    if (!event) return;

    for (const operation of event.operations as any[]) {
      if (operation.filter && !(await this.filter(operation.filter, opts))) continue;
      if (operation.key === 'sendMessage') {
        const message = await this.prepareMessage(operation.message, opts);
        await tmi.say({ message });
      }
      if (operation.key === 'playAudio') {
        const file = await prisma.files.findFirst({ where: { id: operation.audioId } });
        alerts.emitAlert({ audio: { file: file, volume: operation.audioVolume } });
      }
      if (operation.key === 'TTS') tts.emitTTS(await this.prepareMessage(operation.message, opts));
    }
  }

  private async filter(filter: string, opts: any) {
    const toEval = `(async function evaluation () { return ${filter} })()`;

    const run = await safeEval(toEval, this.replaceVariables(opts));

    return run;
  }

  async prepareMessage(message: string, opts: any) {
    for (const [key, value] of Object.entries(this.replaceVariables(opts))) {
      message = message.replace(key, String(value));
    }

    return message;
  }

  private replaceVariables(opts: Record<string, string>) {
    return {
      $name: get(opts, 'name', ''),
      $username: get(opts, 'username', ''),
      $amount: get(opts, 'amount', ''),
      $message: get(opts, 'message', ''),
      $currency: get(opts, 'currency', ''),
      '$sub.tier': get(opts, 'sub.tier', 0),
      '$sub.months': get(opts, 'sub.months', 0),
      '$sub.overallMonths': get(opts, 'sub.overallMonths', 0),
      '$subgift.recipient': get(opts, 'subgift.recipient', ''),
      $viewers: get(opts, 'viewers', 0),
    };
  }

  async addToEventList({ name, data }: { name: string; data: Record<string, any> }) {
    const event = await prisma.eventList.create({ data: { name, data: data, timestamp: Date.now() } });

    this.clients.forEach((c) => c.emit('event', event));
  }

  sockets(client: SocketIO.Socket) {
    this.clients.push(client);
    client.on('disconnect', () => {
      const index = this.clients.indexOf(client);
      this.clients.splice(index, 1);
    });
  }

  onDonation(data: DonationData) {
    this.fire({ name: 'tip', opts: data });
    this.addToEventList({
      name: 'tip',
      data: { username: data.username, currency: data.currency, amount: data.inMainCurrencyAmount, message: data.message },
    });
  }

  onHosted({ viewers, username }: HostType) {
    this.fire({ name: 'hosted', opts: { username, viewers } });
    this.addToEventList({ name: 'hosted', data: { username, viewers } });
  }

  onHosting({ viewers, username }: HostType) {
    this.fire({ name: 'host', opts: { username, viewers } });
    this.addToEventList({ name: 'host', data: { username, viewers } });
  }

  onRaided({ viewers, username }: HostType) {
    this.fire({ name: 'raided', opts: { username, viewers } });
    this.addToEventList({ name: 'raided', data: { username, viewers } });
  }

  onUserFollow({ userName }: EventSubChannelFollowEvent) {
    this.fire({ name: 'follow', opts: { username: userName } });
    this.addToEventList({ name: 'follow', data: { username: userName } });
  }

  onAddModerator(data: EventSubChannelModeratorEvent) {
    this.fire({ name: 'newmod', opts: { username: data.userName } });
    this.addToEventList({ name: 'newmod', data: { username: data.userName } });
  }

  onRemoveModerator(data: EventSubChannelModeratorEvent) {
    this.fire({ name: 'removemod', opts: { username: data.userName } });
    this.addToEventList({ name: 'removemod', data: { username: data.userName } });
  }

  onSubscribe(data: INewSubscriber) {
    this.fire({
      name: 'sub',
      opts: {
        sub: {
          tier: data.tier,
        },
        message: data.message,
        username: data.username,
      },
    });
    this.addToEventList({
      name: 'sub',
      data: { username: data.username, tier: data.tier, message: data.message },
    });
  }

  onReSubscribe(data: INewResubscriber) {
    this.fire({
      name: 'resub',
      opts: {
        sub: {
          tier: data.tier,
          months: data.months,
          overallMonths: data.overallMonths,
        },
        message: data.message,
        username: data.username,
      },
    });

    this.addToEventList({
      name: 'resub',
      data: {
        username: data.username,
        tier: data.tier,
        message: data.message,
        months: data.months,
        overallMonths: data.overallMonths,
      },
    });
  }

  onRedemption(data: PubSubRedemptionMessage) {
    this.fire({
      name: 'redemption',
      opts: {
        name: data.rewardName,
        username: data.userName,
        amount: data.rewardCost,
        message: data.message,
      },
    });

    this.addToEventList({
      name: 'redemption',
      data: { name: data.rewardName, username: data.userName, amount: data.rewardCost, message: data.message },
    });
  }
}

export default new Events();
