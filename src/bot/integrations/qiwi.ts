import axios from 'axios';

import currency from '@bot/libs/currency';
import { onDonation } from '@bot/libs/eventsCaller';
import { info, error } from '@bot/libs/logger';
import { prisma } from '@bot/libs/db';
import { onChange, onLoad, settings } from '../decorators';

class Qiwi {
  pollTimeout: NodeJS.Timeout = null;

  @settings()
    enabled = false;

  @settings()
    token: string = null;

  @onChange(['enabled', 'token'])
  @onLoad()
  async start() {
    if (!this.enabled || !this.token) return;
    info('QIWI: Successfuly initiliazed');
    this.poll();
  }

  private async poll() {
    clearTimeout(this.pollTimeout);
    this.pollTimeout = setTimeout(() => this.poll(), 3 * 1000);
    try {
      const { data } = await axios.get(`https://donate.qiwi.com/api/stream/v1/widgets/${this.token}/events?limit=50`);
      if (data.events.length === 0) return;

      for (const event of data.events) {
        const sender = event.attributes.DONATION_SENDER ?? 'Anonymous';
        const amount = Number(event.attributes.DONATION_AMOUNT);
        const inComingCurrency = event.attributes.DONATION_CURRENCY;
        const message = event.attributes.DONATION_MESSAGE ?? '';

        const user = await prisma.users.findFirst({ where: { username: sender.toLowerCase() } });
        if (user) {
          await prisma.usersTips.create({
            data: {
              amount: event.attributes.DONATION_AMOUNT,
              rates: currency.rates,
              currency: inComingCurrency,
              inMainCurrencyAmount: currency.exchange({ from: inComingCurrency, amount }),
              message,
              timestamp: Date.now(),
              userId: user.id,
            },
          });
        }

        onDonation({
          username: sender,
          userId: user?.id,
          currency: inComingCurrency,
          message,
          amount,
          inMainCurrencyAmount: currency.exchange({ from: inComingCurrency, amount }),
        });
      }
    } catch (e) {
      error(`QIWI: ` + e.message);
    }
  }
}

export default new Qiwi();
