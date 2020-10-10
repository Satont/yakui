import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { Settings } from '@bot/entities/Settings'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import { RequestContext } from '@mikro-orm/core'
import { loadedSystems } from '@bot/libs/loader'

const router = Router({
  mergeParams: true,
})

router.get('/', isAdmin, checkSchema({
  space: {
    isString: true,
    in: ['query'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const space = req.query.space as string
    const repository = RequestContext.getEntityManager().getRepository(Settings)
    const settings = await repository.find({ space })

    res.send(settings)
  } catch (e) {
    next(e)
  }
})

router.post('/', isAdmin, async (req, res, next) => {
  const body: { space: string, name: string, value: any }[] = req.body
  try {
    for (const data of body) {
      const module = loadedSystems.find(s => s.constructor.name.toLowerCase() === data.space)
      if (!module) continue
      module[data.name] = data.value
    }
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
