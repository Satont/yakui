import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Settings from '../../../../models/Settings'

const router = Router({
  mergeParams: true,
})

router.get('/', checkSchema({
  space: {
    isString: true,
    in: ['query']
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const space = req.query.space as string

    const settings = await Settings.findAll({ 
      where: { space }
    })

    res.send(settings)
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  const body: { space: string, name: string, value: any }[] = req.body
  try {
    for (const data of body) {
      const [item, created]: [Settings, boolean] = await Settings.findOrCreate({
        where: { space: data.space, name: data.name },
        defaults: data,
      })

      if (!created) {
        await item.update({ value: data.value })
      }
    }

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
