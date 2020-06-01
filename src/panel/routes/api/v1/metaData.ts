import { Router } from 'express'
import cache from '../../../../libs/cache'
import tmi from '../../../../libs/tmi'

const router = Router()

router.get('/', (req, res) => {
  res.json({ bot: { username: tmi.chatClients?.bot?.currentNick }, channelMetaData: cache.channelMetaData, streamMetaData: cache.streamMetaData })
})


export default router
