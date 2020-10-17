import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { Timer } from '@bot/entities/Timer'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import timers from '@bot/systems/timers'
import { RequestContext, wrap } from '@mikro-orm/core'

const router = Router({
  mergeParams: true,
})

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const timers = await RequestContext.getEntityManager().getRepository(Timer).findAll()

    res.json(timers)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const timer = await RequestContext.getEntityManager().getRepository(Timer).findOne({ id: Number(req.params.id) })

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
  messages: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const body = req.body

    const repository = RequestContext.getEntityManager().getRepository(Timer)
    
    const timer = body.id ? await repository.findOne({ id: Number(body.id) }) : repository.create(body)

    wrap(timer).assign({
      name: body.name,
      enabled: body.enabled,
      interval: body.interval,
      messages: body.messages,
      responses: body.responses,
    })

    await repository.persistAndFlush(timer)
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
    
    const repository = RequestContext.getEntityManager().getRepository(Timer)
    const timer = await repository.findOne({ id: Number(req.body.id) })

    await repository.removeAndFlush(timer)
    await timers.init()

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
