import safeEval from 'safe-eval'
import { get } from 'lodash'

import tmi from '@bot/libs/tmi'
import { System, DonationData, HostType } from 'typings'
import Event from '@bot/models/Event'
import { IWebHookUserFollow, IWebHookModeratorAdd, IWebHookModeratorRemove } from 'typings/webhooks'

export default new class Events implements System {
  alreadyListen = false
  events: Event[] = []

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
      '$subgift.recipient': get(opts, 'subgift.recipient', ''),
      '$host.viewers': get(opts, 'host.viewers', 0),
      '$hosted.viewers': get(opts, 'hosted.viewers', 0),
      '$raid.viewers': get(opts, 'raid.viewers', 0),
    }
  }

  onDonation(data: DonationData ) {
    this.fire( { name: 'tip', opts: data })
  }

  onHosted({ viewers, username }: HostType) {
    this.fire({ name: 'hosted', opts: { username, viewers } })
  }

  onHosting({ viewers, username }: HostType) {
    this.fire({ name: 'host', opts: { username, viewers } })
  }

  onRaided({ viewers, username }: HostType) {
    this.fire({ name: 'raided', opts: { username, viewers } })
  }

  onUserFollow({ from_name }: IWebHookUserFollow) {
    this.fire({ name: 'follow', opts: { username: from_name}})
  }

  onAddModerator({ event_data: { user_name: username } }: IWebHookModeratorAdd) {
    this.fire({ name: 'newmod', opts: { username }})
  }

  onRemoveModerator({ event_data: { user_name: username } }: IWebHookModeratorRemove) {
    this.fire({ name: 'removemod', opts: { username }})
  }

  listenDbUpdates() {
    Event.afterDestroy(() => this.init())
    Event.afterSave(() => this.init())
  }
}
