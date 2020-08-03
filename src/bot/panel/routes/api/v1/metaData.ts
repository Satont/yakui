import { Router } from 'express'
import twitch from '../../../../systems/twitch'
import tmi from '../../../../libs/tmi'
import currency from '@bot/libs/currency'
import locales from '@bot/libs/locales'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    bot: { username: tmi.chatClients?.bot?.currentNick },
    channel: twitch.channelMetaData,
    stream: twitch.streamMetaData,
    mainCurrency: currency.botCurrency,
    lang: locales.translate('lang.code')
  })
})

export default router
