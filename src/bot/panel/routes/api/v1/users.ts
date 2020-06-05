import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import User from '../../../../models/User'
import UserBits from '../../../../models/UserBits'
import UserTips from '../../../../models/UserTips'
import currency from '../../../../libs/currency'

const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const body = req.query as any
    
    const { count, rows }: { count: number, rows: User[] } = await User.findAndCountAll({
      order: [ [body.sortBy, Boolean(body.sortDesc) ? 'DESC': 'ASC'] ],
      offset: (Number(body.page) - 1) * Number(body.perPage),
      limit: Number(body.perPage),
      attributes: { include: ['totalTips', 'totalBits' ]},
      include: [UserBits, UserTips]
    })

    res.json({ users: rows, total: count })
  } catch (e) {
    next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const user: User[] = await User.findOne({
      where: { id: req.params.id },
      include: [UserBits, UserTips]
    })

    res.json(user)
  } catch (e) {
    next(e)
  }
})

router.delete('/', checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    await User.destroy({ where: { id: req.body.id } })

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

router.post('/', checkSchema({
  user: {
    in: ['body'],
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    const user: User = await User.findOne({ 
      where: { id: req.body.user?.id },
      include: [UserBits, UserTips]
    })

    if (!user) throw new Error('User not found')

    for (let bit of req.body.user.bits) {
      if (bit.id) {
        const [instance, created]: [UserBits, boolean] = await UserBits.findOrCreate({
          where: { id: bit.id },
          defaults: bit
        })
        if (!created) await instance.update(bit)
      } else await UserBits.create(bit)
    }

    for (let bit of req.body.delete.bits) {
      await UserBits.destroy({ where: { id: bit }})
    }

    for (let tip of req.body.delete.tips) {
      await UserTips.destroy({ where: { id: tip }})
    }

    for (let tip of req.body.user.tips) {
      tip = {
        ...tip,
        inMainCurrencyAmount: currency.exchange({ amount: tip.amount, from: tip.currency }),
        rates: currency.rates
      }
    
      if (tip.id) {
        const [instance, created]: [UserTips, boolean] = await UserTips.findOrCreate({
          where: { id: tip.id },
          defaults: tip
        })
        if (!created) await instance.update(tip)
      } else await UserTips.create(tip)
    }

    delete req.body.user.bits
    delete req.body.user.tips

    await user.update(req.body.user)

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
