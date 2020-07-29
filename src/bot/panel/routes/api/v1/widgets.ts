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
  top: {
    isNumeric: true,
    in: ['body'],
  },
  left: {
    isNumeric: true,
    in: ['body'],
  },
  width: {
    isNumeric: true,
    in: ['body'],
  },
  height: {
    isNumeric: true,
    in: ['body'],
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    if (!req.body.id) {
      await Widget.create(req.body)
    } else {
      const widget: Widget = await Widget.findOne({ where: { id: req.body.id }})

      widget.height = req.body.height
      widget.width = req.body.width
      widget.top = req.body.top
      widget.left = req.body.left
      widget.name = req.body.name

      await widget.save()
    }

    res.json('Ok')
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
