import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { Settings } from '@bot/entities/Settings'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import { RequestContext, wrap } from '@mikro-orm/core'

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
    console.log(settings)
    res.send(settings)
  } catch (e) {
    next(e)
  }
})

router.post('/', isAdmin, async (req, res, next) => {
  const body: { space: string, name: string, value: any }[] = req.body
  try {
    const repository = RequestContext.getEntityManager().getRepository(Settings)
    const entities: Settings[] = []
    for (const data of body) {
      const item = await repository.findOne({ space: data.space, name: data.name }) || repository.create(data)
      
      wrap(item).assign({
        value: data.value,
      })
      entities.push(item)
    }

    await repository.persistAndFlush(entities)
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
