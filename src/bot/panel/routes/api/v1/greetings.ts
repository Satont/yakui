import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { Greeting } from '@bot/entities/Greeting'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import cache from '@bot/libs/cache'
import { RequestContext } from '@mikro-orm/core'

const router = Router({
  mergeParams: true,
})

router.get('/', async (req, res, next) => {
  try {
    res.json([...cache.greetings.values()])
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  const greeting = [...cache.greetings.values()].find(g => g.id === Number(req.params.id))
  greeting.sound_file = greeting.sound_file.id as any

  try {
    res.json(greeting)
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
  username: {
    in: ['body'],
    optional: true,
  },
  userId: {
    in: ['body'],
    optional: true,
  },
  message: {
    isString: true,
    in: ['body'],
  },
  enabled: {
    isBoolean: true,
    in: ['body'],
  },
  sound_file: {
    isNumeric: true,
    in: ['body'],
    optional: {
      options: {
        nullable: true,
        checkFalsy: false,
      },
    },
  },
  sound_volume: {
    isNumeric: true,
    in: ['body'],
    optional: {
      options: {
        nullable: true,
        checkFalsy: false,
      },
    },
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const body = req.body

    const repository = RequestContext.getEntityManager().getRepository(Greeting)
    const greeting = body.id ? await repository.findOne({ id: Number(body.id) }) : repository.create(body)

    repository.assign(greeting, {
      userId: body.userId ? Number(body.userId) : null,
      ...body,
    })

    await repository.persistAndFlush(greeting)
    await cache.updateGreetings()
    res.json(greeting)
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
    const repository = RequestContext.getEntityManager().getRepository(Greeting)
    const greeting = await repository.findOne({ id: Number(req.body.id) })

    await repository.removeAndFlush(greeting)
    await cache.updateGreetings()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
