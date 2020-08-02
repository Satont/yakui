import { Router, Request, Response, NextFunction } from 'express'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import Widget from '@bot/models/Widget'
import { checkSchema, validationResult } from 'express-validator'

const router = Router()

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const widgets: Widget[] = await Widget.findAll()

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
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    let widget: Widget
    if (!req.body.id) {
      widget = await Widget.create(req.body)
    } else {
      widget = await Widget.findOne({ where: { id: req.body.id }})

      widget.h = req.body.h
      widget.w = req.body.w
      widget.y = req.body.y
      widget.x = req.body.x
      widget.name = req.body.name

      await widget.save()
    }

    res.json(widget)
  } catch (e) {
    next(e)
  }
})

router.delete('/', isAdmin,  checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    await Widget.destroy({ where: { id: req.body.id }})

    res.json('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
