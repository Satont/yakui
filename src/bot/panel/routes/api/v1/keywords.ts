import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { Keyword } from '@bot/entities/Keyword'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import cache from '@bot/libs/cache'
import { RequestContext, wrap } from '@mikro-orm/core'

const router = Router({
  mergeParams: true,
})

router.get('/', async (req, res, next) => {
  try {
    res.json([...cache.keywords.values()])
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const keyword = cache.keywords.get(req.params.id)

    res.json(keyword)
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
  response: {
    isString: true,
    in: ['body'],
    optional: true,
  },
  cooldown: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const body = req.body

    const repository = RequestContext.getEntityManager().getRepository(Keyword)
    const keyword = body.id ? await repository.findOne({ id: body.id }) : repository.create(body)

    wrap(keyword).assign({
      name: body.name,
      enabled: body.enabled,
      response: body.response,
      cooldown: body.cooldown,
    })

    await repository.persistAndFlush(keyword)
    await cache.updateKeywords()
    res.json(keyword)
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
    const repository = RequestContext.getEntityManager().getRepository(Keyword)

    await repository.removeAndFlush(await repository.findOne({ id: req.body.id }))
    await cache.updateKeywords()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
