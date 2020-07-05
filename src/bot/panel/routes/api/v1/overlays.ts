import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Overlays from '@bot/systems/overlays'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import Overlay from '@bot/models/Overlay'

const router = Router({ mergeParams: true })


router.get('/', async (req, res, next) => {
  try {
    res.json(await Overlay.findAll())
  } catch (e) {
    next(e)
  }
})

router.get('/:id', (req, res, next) => {
  try {
    const overlay = Overlays.getOverlay(Number(req.params.id))

    res.json(overlay)
  } catch (e) {
    next(e)
  }
})

router.get('/parse/:id', async (req, res, next) => {
  try {
    const data = await Overlays.parseOverlayData(Number(req.params.id))

    res.json(data)
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
  data: {
    isString: true,
    in: ['body']
  },
  css: {
    isString: true,
    in: ['body'],
    optional: true,
  },
  js: {
    isArray: true,
    in: ['body'],
    optional: true
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    const overlay = await Overlay.create(req.body)

    res.json(overlay)
  } catch (e) {
    next(e)
  }
})

export default router
