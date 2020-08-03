import { Router } from 'express'
import twitch from '../../../../systems/twitch'
import tmi from '../../../../libs/tmi'
import currency from '@bot/libs/currency'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    bot: { username: tmi.chatClients?.bot?.currentNick },
    channel: twitch.channelMetaData,
    stream: twitch.streamMetaData,
    mainCurrency: currency.botCurrency
  })
})

export default router
