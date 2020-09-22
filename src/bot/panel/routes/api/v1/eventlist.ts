import { Router } from 'express'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import EventList from '@bot/models/EventList'

const router = Router({
  mergeParams: true,
})

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const eventlist = await EventList.findAll({ limit: 100, order: [['timestamp', 'desc']] })

    res.send(eventlist)
  } catch (e) {
    next(e)
  }
})

export default router
