import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Keyword from '@bot/models/Keyword'
import isAdmin from '@bot/panel/middlewares/isAdmin'

const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const keywords: Keyword[] = await Keyword.findAll()

    res.json(keywords)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const keywords: Keyword[] = await Keyword.findOne({ where: { id: req.params.id }})

    res.json(keywords)
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
    in: ['body']
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

    let keyword: Keyword

    if (body.id) keyword = await Keyword.findOne({ where: { id: body.id } })
    else keyword = await Keyword.create(body)

    if (body.id) {
      await keyword.update({
        name: body.name,
        enabled: body.enabled,
        response: body.response,
        cooldown: body.cooldown,
      })
    }

    res.json(keyword)
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
    await Keyword.destroy({ where: { id: req.body.id }})

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
