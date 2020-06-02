import { Router } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import User from '../../../../models/User'
import UserBits from '../../../../models/UserBits'
import UserTips from '../../../../models/UserTips'
import { fn, col } from 'sequelize'


const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const body: {
      sortBy: string,
      sortDesc: boolean,
      page: number,
      perPage: number
    } = req.query as any

    const users: User[] = await User.findAll({
      order: [ [body.sortBy, body.sortDesc ? 'DESC': 'ASC'] ],
      offset: (body.page - 1) * body.perPage,
      limit: body.perPage,
      include: [UserBits, UserTips]
    })

    res.json(users)
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
}), async (req, res, next) => {
  try {
    validationResult(req).throw()
    await User.destroy({ where: { id: req.body.id }})

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})

export default router
