import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Overlays from '@bot/systems/overlays'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import Overlay from '@bot/models/Overlay'
import cache from '@bot/libs/cache'

const router = Router({ mergeParams: true })


router.get('/', async (req, res, next) => {
  try {
    res.json([...cache.overlays.values()])
  } catch (e) {
    next(e)
  }
})

router.get('/:id', (req, res, next) => {
  try {
    const overlay = Overlays.getOverlay(req.params.id)

    res.json(overlay)
  } catch (e) {
    next(e)
  }
})

router.get('/parse/:id', async (req, res, next) => {
  try {
    const data = await Overlays.parseOverlayData(req.params.id)

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
    in: ['body'],
  },
  data: {
    isString: true,
    in: ['body'],
  },
  css: {
    isString: true,
    in: ['body'],
    optional: {
      options: { nullable: true },
    },
  },
  js: {
    isArray: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    let overlay: Overlay
    if (req.body.id) overlay = await Overlay.findOne({ where: { id: req.body.id }})
    else overlay = await Overlay.create(req.body)

    if (req.body.id) {
      overlay.update({
        name: req.body.name,
        data: req.body.data,
        css: req.body.css,
        js: req.body.js,
      })
    }
    
    await cache.updateOverlays()
    res.json(overlay)
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

    await Overlay.destroy({ where: { id: req.body.id }})
    await cache.updateOverlays()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
