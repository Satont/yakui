import { onChange, settings } from '../decorators'
import locales from '../libs/locales'
import webhooks from '../libs/webhooks'

class General {
  @settings()
  siteUrl = 'http://localhost:3000'

  @settings()
  locale = 'ru'

  @onChange('siteUrl')
  onSiteUrlChange() {
    webhooks.init()
  }

  @onChange('locale')
  onLocaleChange() {
    locales.init()
  }

}

export default new General()