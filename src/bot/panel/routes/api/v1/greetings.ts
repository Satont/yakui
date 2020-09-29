import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Greeting from '@bot/models/Greeting'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import cache from '@bot/libs/cache'

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
  try {
    res.json(cache.greetings.get(req.params.id))
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
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const body = req.body

    let greeting: Greeting

    if (body.id) greeting = await Greeting.findOne({ where: { id: body.id } })
    else greeting = await Greeting.create(body)

    if (body.id) {
      await greeting.update({
        username: body.username,
        userId: body.userId ? Number(body.userId) : null,
        message: body.message,
        enabled: body.enabled,
      })
    }
    
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
    await Greeting.destroy({ where: { id: req.body.id }})
    await cache.updateGreetings()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
