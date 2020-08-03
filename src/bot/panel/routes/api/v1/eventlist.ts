import { Router } from 'express'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import EventList from '@bot/models/EventList'
import events from '@bot/systems/events'

const router = Router({
  mergeParams: true
})

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const eventlist = await EventList.findAll({ limit: 100, order: [['timestamp', 'desc']] })

    res.send(eventlist)
  } catch (e) {
    next(e)
  }
})

router.post('/heartbeat', isAdmin, async (req, res, next) => {
  try {
    const timestamp = Number(req.body.timestamp)

    if (isNaN(timestamp) || typeof req.body.timestamp === null) res.json(false)
    else if (timestamp < events.latestTimestamp) res.json(false)
    else res.json(true)
  } catch (e) {
    next(e)
  }
})

export default router
