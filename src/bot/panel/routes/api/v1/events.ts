import { Router } from 'express'
import Event from '../../../../models/Event'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.findAll()

    res.send(events)
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data: { name: string, operations: any[] } = req.body

    const [event, created]: [Event, boolean] = await Event.findOrCreate({
      where: { name: data.name },
      defaults: { name: data.name, operations: data.operations }
    })

    if (!created) {
      await event.update({ operations: data.operations })
    }

    res.send(event)
  } catch (e) {
    next(e)
  }
})

export default router