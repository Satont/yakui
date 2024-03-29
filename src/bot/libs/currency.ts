import axios from 'axios';
import { settings } from '../decorators';
import { info, error } from './logger';

export type currency =
  | 'CAD'
  | 'HKD'
  | 'ISK'
  | 'PHP'
  | 'DKK'
  | 'HUF'
  | 'CZK'
  | 'GBP'
  | 'RON'
  | 'SEK'
  | 'IDR'
  | 'INR'
  | 'BRL'
  | 'RUB'
  | 'HRK'
  | 'JPY'
  | 'THB'
  | 'CHF'
  | 'EUR'
  | 'MYR'
  | 'BGN'
  | 'TRY'
  | 'CNY'
  | 'NOK'
  | 'NZD'
  | 'ZAR'
  | 'USD'
  | 'MXN'
  | 'SGD'
  | 'AUD'
  | 'ILS'
  | 'KRW'
  | 'PLN';

class Currency {
  private base: currency = 'USD';
  private updateRatesTimeout: NodeJS.Timeout = null;

  rates: { [key in currency]: number } = {
    CAD: 0,
    HKD: 0,
    ISK: 0,
    PHP: 0,
    DKK: 0,
    HUF: 0,
    CZK: 0,
    GBP: 0,
    RON: 0,
    SEK: 0,
    IDR: 0,
    INR: 0,
    BRL: 0,
    RUB: 0,
    HRK: 0,
    JPY: 0,
    THB: 0,
    CHF: 0,
    EUR: 0,
    MYR: 0,
    BGN: 0,
    TRY: 0,
    CNY: 0,
    NOK: 0,
    NZD: 0,
    ZAR: 0,
    USD: 0,
    MXN: 0,
    SGD: 0,
    AUD: 0,
    ILS: 0,
    KRW: 0,
    PLN: 0,
  };

  @settings()
    botCurrency: currency = 'RUB';

  constructor() {
    this.updateRates();
  }

  exchange({ amount, from, to }: { amount: number; from: currency; to?: currency }) {
    if (!to) to = this.botCurrency;

    if (from.toLowerCase() === to.toLowerCase()) return amount;

    if (this.rates[from] === undefined) throw `${from} code was not found`;

    if (this.rates[to] === undefined) throw `${to} code was not found`;

    return Number(((amount * this.rates[to]) / this.rates[from]).toFixed(3));
  }

  private async updateRates() {
    clearTimeout(this.updateRatesTimeout);
    try {
      type Rates = {
        [key in currency]: number;
      };
      const { data } = await axios.get<{ conversion_rates: Rates }>(
        `https://v6.exchangerate-api.com/v6/70e7e29014fed7ff595d594f/latest/${this.base}`,
      );

      const rates = data.conversion_rates;

      for (const [rate, value] of Object.entries(rates)) {
        this.rates[rate] = Number(value.toFixed(4));
      }

      info('CURRENCY: Successfuly updated');
    } catch (e) {
      error(`CURRENCY: Cannot update`);
      error(e);
    } finally {
      this.updateRatesTimeout = setTimeout(() => this.updateRates(), 12 * 60 * 60 * 1000);
    }
  }
}

export default new Currency();
