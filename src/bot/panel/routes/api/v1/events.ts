import { Router } from 'express'
import Event from '@bot/models/Event'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import events from '@bot/systems/events'

const router = Router()

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const events = await Event.findAll()

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
      defaults: { name: data.name, operations: data.operations }
    })

    if (!created) {
      await event.update({ operations: data.operations })
    }
    await events.init()
    res.send(event)
  } catch (e) {
    next(e)
  }
})

export default router
