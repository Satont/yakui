import { readFileSync } from 'fs';
import { resolve } from 'path';
import { get } from 'lodash';
import { info } from './logger';
import General from '../settings/general';

const parameterizedString = (...args) => {
  const params = args.slice(1);
  return args[0].replace(/\$[0-9]+/g, matchedStr => (params[matchedStr.replace('$', '')]));
};

const langsDir = resolve(process.cwd(), 'locales');

export default new class Locales {
  lang: any;

  async init() {
    const lang = resolve(langsDir, `${General.locale}.json`);
    this.lang = JSON.parse(readFileSync(lang, 'utf-8'));

    info(`LOCALES: ${this.lang.lang?.name || General.locale} lang loaded`);
  }

  translate(...args: any[]): string {
    const path = args[0];
    const result = get(this.lang, path, null);
    if (!result) return get(this.lang, 'errors.langStringNotFound');

    return parameterizedString(result, ...args.slice(1));
  }

  translateWithNulled(...args: any[]): string | null {
    const path = args[0];
    const result = get(this.lang, path, null);
    if (!result) return result;

    return parameterizedString(result, ...args.slice(1));
  }
};
