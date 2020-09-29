import { Router } from 'express'
import Event from '@bot/models/Event'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import cache from '@bot/libs/cache'

const router = Router()

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const events = [...cache.events.values()]

    res.send(events)
  } catch (e) {
    next(e)
  }
})

router.post('/', isAdmin, async (req, res, next) => {
  try {
    const data: { name: string, operations: any[] } = req.body

    const [event, created]: [Event, boolean] = await Event.findOrCreate({
      where: { name: data.name },
      defaults: { name: data.name, operations: data.operations },
    })

    if (!created) {
      await event.update({ operations: data.operations })
    }
    
    await cache.updateEvents()
    res.send(event)
  } catch (e) {
    next(e)
  }
})

export default router
