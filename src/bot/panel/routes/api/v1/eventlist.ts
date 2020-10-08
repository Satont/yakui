import { Router } from 'express'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import { EventList } from '@bot/entities/EventList'
import { RequestContext } from '@mikro-orm/core'

const router = Router({
  mergeParams: true,
})

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const eventlist = await RequestContext.getEntityManager().getRepository(EventList).find({}, { limit: 100, orderBy: { timestamp: 'desc' } })

    res.send(eventlist)
  } catch (e) {
    next(e)
  }
})

export default router
