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
    console.log(users)
    res.json(users)
  } catch (e) {
    next(e)
  }
})

export default router
