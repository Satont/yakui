import { Router } from 'express'
import twitch from '../../../../libs/twitch'
import tmi from '../../../../libs/tmi'

const router = Router()

router.get('/', (req, res) => {
  res.json({ bot: { username: tmi.chatClients?.bot?.currentNick }, channelMetaData: twitch.channelMetaData, streamMetaData: twitch.streamMetaData })
})

export default router
