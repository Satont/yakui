import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Timer from '@bot/models/Timer'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import timers from '@bot/systems/timers'

const router = Router({
  mergeParams: true,
})

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const timers: Timer[] = await Timer.findAll()

    res.json(timers)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const timer: Timer[] = await Timer.findOne({ where: { id: req.params.id }})

    res.json(timer)
  } catch (e) {
    next(e)
  }
})

router.post('/', isAdmin, checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
  name: {
    isString: true,
    in: ['body'],
  },
  enabled: {
    isBoolean: true,
    in: ['body'],
    optional: true,
  },
  responses: {
    isArray: true,
    in: ['body'],
    optional: true,
  },
  interval: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const body = req.body

    let timer: Timer

    if (body.id) timer = await Timer.findOne({ where: { id: body.id } })
    else timer = await Timer.create(body)

    if (body.id) {
      await timer.update({
        name: body.name,
        enabled: body.enabled,
        interval: body.interval,
        responses: body.responses,
      })
    }
    await timers.init()
    res.json(timer)
  } catch (e) {
    next(e)
  }
})

router.delete('/', isAdmin, checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    await Timer.destroy({ where: { id: req.body.id }})
    await timers.init()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
