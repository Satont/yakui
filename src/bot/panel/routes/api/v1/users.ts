import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'

import {User} from '@bot/entities/User'
import currency from '@bot/libs/currency'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import { RequestContext, wrap } from '@mikro-orm/core'
import { UserBit } from '@/src/bot/entities/UserBit'
import { UserTip } from '@/src/bot/entities/UserTip'

const router = Router({
  mergeParams: true,
})

router.get('/', async (req, res, next) => {
  try {
    const body = req.query as any
    const repository = RequestContext.getEntityManager().getRepository(User)
    const where = body.byUsername ? {
      username: { $like: body.byUsername },
    } : {}

    const [users, total] = await repository.findAndCount(where, {
      limit: Number(body.perPage),
      offset: (Number(body.page) - 1) * Number(body.perPage),
      orderBy: { [body.soryBy]: JSON.parse(body.sortDesc) ? 'desc': 'asc' },
      populate: ['tips', 'bits'],
    })

    res.json({ users , total })
  } catch (e) {
    next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const repository = RequestContext.getEntityManager().getRepository(User)
    const user = await repository.findOne(Number(req.params.id), ['bits', 'tips'])

    res.json(user)
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
    const repository = RequestContext.getEntityManager().getRepository(User)
    const user = await repository.findOne(Number(req.params.id))
    
    await repository.removeAndFlush(user)
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

router.post('/', isAdmin, checkSchema({
  user: {
    in: ['body'],
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    const repository = RequestContext.getEntityManager().getRepository(User)
    const bitRepository = RequestContext.getEntityManager().getRepository(UserBit)
    const tipRepository = RequestContext.getEntityManager().getRepository(UserTip)
    const user = await repository.findOne(Number(req.body.user?.id), ['bits', 'tips'])

    if (!user) throw new Error('User not found')

    for (const bodyBit of req.body.user.bits) {
      const bit = await bitRepository.findOne(bodyBit.id) || bitRepository.create(bodyBit)
      wrap(bit).assign(bodyBit)
      repository.persistAndFlush(bit)
    }

    for (const bit of req.body.delete.bits) {
      await bitRepository.removeAndFlush(await bitRepository.findOne({ id: bit }))
    }

    for (const tip of req.body.delete.tips) {
      await tipRepository.removeAndFlush(await tipRepository.findOne({ id: tip }))
    }

    for (let bodyTip of req.body.user.tips) {
      bodyTip = {
        ...bodyTip,
        inMainCurrencyAmount: currency.exchange({ amount: bodyTip.amount, from: bodyTip.currency }),
        rates: currency.rates,
      }

      const tip = await tipRepository.findOne(bodyTip.id) || tipRepository.create(bodyTip)
      wrap(tip).assign(bodyTip)
      
      await repository.persistAndFlush(tip)
    }

    delete req.body.user.bits
    delete req.body.user.tips

    wrap(user).assign(req.body.user)
    await repository.persistAndFlush(user)

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
