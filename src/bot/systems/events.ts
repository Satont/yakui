import safeEval from 'safe-eval'
import { get } from 'lodash'

import tmi from '@bot/libs/tmi'
import { System, DonationData, HostType } from 'typings'
import Event from '@bot/models/Event'
import { IWebHookUserFollow, IWebHookModeratorAdd, IWebHookModeratorRemove, INewResubscriber, INewSubscriber } from 'typings/events'
import EventList from '@bot/models/EventList'
import { getNameSpace } from '@bot/libs/socket'

export default new class Events implements System {
  events: Event[] = []
  widgetSocket = getNameSpace('widgets/eventlist')

  async init() {
    this.loadEvents()
  }

  async loadEvents() {
    const events = await Event.findAll()

    this.events = events
  }

  async fire({ name, opts }: { name: string, opts: any }) {
    const event = this.events.find(o => o.name === name)
    if (!event) return

    for (const operation of event.operations) {
      if (operation.filter) {
        if (!await this.filter(operation.filter, opts)) continue
      }
      if (operation.key === 'sendMessage') await this.sendMessage(operation.message, opts)
    }
  }

  private async filter(filter: string, opts: any) {
    const toEval = `(async function evaluation () { return ${filter} })()`

    const run = await safeEval(toEval, this.replaceVariables(opts))

    return run
  }

  async sendMessage(message: string, opts: any) {

    for (const [key, value] of Object.entries(this.replaceVariables(opts))) {
      message = message.replace(key, value)
    }

    await tmi.say({ message })
  }

  private replaceVariables(opts: any) {
    return {
      $username: get(opts, 'username', ''),
      $amount: get(opts, 'amount', ''),
      $message: get(opts, 'message', ''),
      $currency: get(opts, 'currency', ''),
      '$sub.tier': get(opts, 'sub.tier', 0),
      '$sub.months': get(opts, 'sub.months', 0),
      '$sub.overallMonths': get(opts, 'sub.overallMonths', 0),
      '$subgift.recipient': get(opts, 'subgift.recipient', ''),
      '$host.viewers': get(opts, 'host.viewers', 0),
      '$hosted.viewers': get(opts, 'hosted.viewers', 0),
      '$raid.viewers': get(opts, 'raid.viewers', 0),
    }
  }

  async addToEventList({ name, data }: { name: string, data: object }) {
    const event: EventList = await EventList.create({ name, data })
    this.widgetSocket.emit('event', event)
  }

  onDonation(data: DonationData) {
    this.fire( { name: 'tip', opts: data })
    this.addToEventList({
      name: 'tip',
      data: { username: data.username, currency: data.currency, amount: data.inMainCurrencyAmount, message: data.message }
    })
  }

  onHosted({ viewers, username }: HostType) {
    this.fire({ name: 'hosted', opts: { username, viewers } })
    this.addToEventList({ name: 'hosted', data: { username, viewers } })
  }

  onHosting({ viewers, username }: HostType) {
    this.fire({ name: 'host', opts: { username, viewers } })
    this.addToEventList({ name: 'host', data: { username, viewers } })
  }

  onRaided({ viewers, username }: HostType) {
    this.fire({ name: 'raided', opts: { username, viewers } })
    this.addToEventList({ name: 'raided', data: { username, viewers } })
  }

  onUserFollow({ from_name }: IWebHookUserFollow) {
    this.fire({ name: 'follow', opts: { username: from_name } })
    this.addToEventList({ name: 'follow', data: { username: from_name } })
  }

  onAddModerator({ event_data: { user_name: username } }: IWebHookModeratorAdd) {
    this.fire({ name: 'newmod', opts: { username }})
    this.addToEventList({ name: 'newmod', data: { username } })
  }

  onRemoveModerator({ event_data: { user_name: username } }: IWebHookModeratorRemove) {
    this.fire({ name: 'removemod', opts: { username }})
    this.addToEventList({ name: 'removemod', data: { username } })
  }

  onSubscribe(data: INewSubscriber) {
    this.fire({
      name: 'sub',
      opts: {
        sub: {
          tier: data.tier,
        },
        message: data.message,
        username: data.username
      }
    })
    this.addToEventList({
      name: 'sub',
      data: { username: data.username, tier: data.tier, message: data.message }
    })
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
        username: data.username
      }
    })

    this.addToEventList({
      name: 'resub',
      data: { username: data.username, tier: data.tier, message: data.message, months: data.months, overallMonths: data.overallMonths }
    })
  }
}
