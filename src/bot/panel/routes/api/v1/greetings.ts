import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Greeting from '@bot/models/Greeting'
import isAdmin from '@bot/panel/middlewares/isAdmin'

const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const greetings: Greeting[] = await Greeting.findAll()

    res.json(greetings)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const greeting: Greeting[] = await Greeting.findOne({ where: { id: req.params.id }})

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
    in: ['body']
  },
  enabled: {
    isBoolean: true,
    in: ['body'],
  }
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
        userId: Number(body.userId),
        message: body.message,
        enabled: body.enabled
      })
    }

    res.json(greeting)
  } catch (e) {
    next(e)
  }
})

router.delete('/', isAdmin, checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    await Greeting.destroy({ where: { id: req.body.id }})

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
