import { Router, Request, Response, NextFunction } from 'express'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import {Widget} from '@bot/entities/Widget'
import { checkSchema, validationResult } from 'express-validator'
import { RequestContext, wrap } from '@mikro-orm/core'

const router = Router()

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const repository = RequestContext.getEntityManager().getRepository(Widget)
    const widgets = await repository.findAll()

    res.json(widgets)
  } catch (e) {
    next(e)
  }
})

router.post('/', isAdmin,  checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
  y: {
    isNumeric: true,
    in: ['body'],
  },
  x: {
    isNumeric: true,
    in: ['body'],
  },
  w: {
    isNumeric: true,
    in: ['body'],
  },
  h: {
    isNumeric: true,
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    const repository = RequestContext.getEntityManager().getRepository(Widget)
    const widget = await repository.findOne(req.body.id) || repository.create(req.body)

    wrap(widget).assign(req.body)
    await repository.persistAndFlush(widget)

    res.json(widget)
  } catch (e) {
    next(e)
  }
})

router.delete('/', isAdmin,  checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const repository = RequestContext.getEntityManager().getRepository(Widget)
    const widget = await repository.findOne(req.body.id)

    await repository.removeAndFlush(widget)
    res.json('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
