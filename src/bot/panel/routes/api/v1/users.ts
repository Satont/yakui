import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'

import { User } from '@bot/entities/User'
import currency from '@bot/libs/currency'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import { RequestContext, wrap } from '@mikro-orm/core'
import { UserBit } from '@bot/entities/UserBit'
import { UserTip } from '@bot/entities/UserTip'
import { orm } from '@/src/bot/libs/db'
import { QueryBuilder } from '@mikro-orm/postgresql'

const router = Router({
  mergeParams: true,
})

const qb: QueryBuilder<User> = (orm.em as any).createQueryBuilder(User, 'user')

router.get('/', async (req, res, next) => {
  try {
    const body = req.query as any
    const repository = RequestContext.getEntityManager().getRepository(User)
    const where = body.byUsername ? {
      username: { $like: `%${body.byUsername}%` },
    } : {}


    const query = qb
      .select('user.*')
      .join('user.tips', 'userTips', null, 'leftJoin')
      .join('user.bits', 'userBits', null, 'leftJoin')
      .where(where)
      .addSelect('COALESCE(SUM("userTips"."inMainCurrencyAmount"), 0) as "tips"')
      .addSelect('COALESCE(SUM("userBits"."amount"), 0) as "bits"')
      .offset((Number(body.page) - 1) * Number(body.perPage))
      .limit(Number(body.perPage))
      .groupBy('id')
      .getKnexQuery()
      .orderByRaw(`"${body.sortBy}" ${JSON.parse(body.sortDesc) ? 'DESC': 'ASC'} NULLS LAST`)
      .toQuery()

    const users = await orm.em.getConnection().execute(query)
    const total = await repository.count()
    /* const [users, total] = await repository.findAndCount(where, {
      limit: Number(body.perPage),
      offset: (Number(body.page) - 1) * Number(body.perPage),
      orderBy: { [body.sortBy]: JSON.parse(body.sortDesc) ? 'desc': 'asc' },
      populate: ['tips', 'bits'],
    }) */

    res.json({ users, total })
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
    const user = await repository.findOne(req.body.user.id, ['bits', 'tips'])

    if (!user) throw new Error('User not found')

    for (const bodyBit of req.body.user.bits) {
      const bit = bodyBit.id ? await bitRepository.findOne(bodyBit.id) : new UserBit()
      bitRepository.assign(bit, { ...bodyBit, user: bodyBit.userId })
      bitRepository.persist(bit)
    }
    
    for (const id of req.body.delete.bits) {
      bitRepository.remove(await bitRepository.findOne({ id }))
    }
    
    for (const id of req.body.delete.tips) {
      tipRepository.remove(await tipRepository.findOne({ id }))
    }
    
    for (let bodyTip of req.body.user.tips) {
      bodyTip = {
        ...bodyTip,
        inMainCurrencyAmount: currency.exchange({ amount: bodyTip.amount, from: bodyTip.currency }),
        rates: currency.rates,
        amount: Number(bodyTip.amount),
      }
      
      const tip = bodyTip.id ? await tipRepository.findOne(bodyTip.id) : new UserTip()

      tipRepository.assign(tip, bodyTip)
      tipRepository.persist(tip)
    }
    
    delete req.body.user.bits
    delete req.body.user.tips
    
    wrap(user).assign(req.body.user)

    await bitRepository.flush()
    await tipRepository.flush()
    await repository.flush()

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
