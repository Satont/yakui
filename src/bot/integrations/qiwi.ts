import axios from 'axios'

import { Integration } from '@src/typings'
import { Settings } from '@bot/entities/Settings'
import User  from '@bot/models/User'
import UserTips from '@bot/models/UserTips'
import currency from '@bot/libs/currency'
import { onDonation } from '@bot/libs/eventsCaller'
import { info, error } from '@bot/libs/logger'
import { orm } from '@bot/libs/db'

export default new class Qiwi implements Integration {
  pollTimeout: NodeJS.Timeout = null
  token: string = null

  async init() {
    clearTimeout(this.pollTimeout)
    const [enabled, token] = await Promise.all([
      orm.em.getRepository(Settings).findOne({ space: 'qiwi', name: 'enabled' }),
      orm.em.getRepository(Settings).findOne({ space: 'qiwi', name: 'token' }),
    ])

    if (!enabled || !token || !token?.value.trim().length) return
    info('QIWI: Successfuly initiliazed')
    this.token = token.value
    this.poll()
  }

  private async poll() {
    clearTimeout(this.pollTimeout)
    this.pollTimeout = setTimeout(() => this.poll(), 3 * 1000)
    try {
      const { data } = await axios.get(`https://donate.qiwi.com/api/stream/v1/widgets/${this.token}/events?limit=50`)
      if (data.events.length === 0) return

      for (const event of data.events) {
        const sender = event.attributes.DONATION_SENDER ?? 'Anonymous'
        const amount = Number(event.attributes.DONATION_AMOUNT)
        const inComingCurrency = event.attributes.DONATION_CURRENCY
        const message = event.attributes.DONATION_MESSAGE ?? ''

        const user: User = await User.findOne({ where: { username: sender.toLowerCase() } })
        if (user) {
          UserTips.create({
            userId: user.id,
            amount,
            rates: currency.rates,
            currency: inComingCurrency,
            inMainCurrencyAmount: currency.exchange({ from: inComingCurrency, amount }),
            message,
            timestamp: Date.now(),
          }).catch(error)
        }

        onDonation({
          username: sender,
          userId: user?.id,
          currency: inComingCurrency,
          message,
          amount,
          inMainCurrencyAmount: currency.exchange({ from: inComingCurrency, amount }),
        })
      }
    } catch (e) {
      error(e.message)
    }
  }
}