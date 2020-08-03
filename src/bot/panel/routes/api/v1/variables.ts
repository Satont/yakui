import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Variable from '@bot/models/Variable'
import variables from '@bot/systems/variables'
import isAdmin from '@bot/panel/middlewares/isAdmin'

const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const variables: Variable[] = await Variable.findAll()

    res.json(variables)
  } catch (e) {
    next(e)
  }
})

router.get('/all', async (req, res, next) => {
  try {
    res.json(variables.variables)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const variable: Variable[] = await Variable.findOne({ where: { id: req.params.id }})
    await variables.init()
    res.json(variable)
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
  enabled: {
    isBoolean: true,
    in: ['body'],
    optional: true,
  },
  response: {
    isString: true,
    in: ['body'],
    optional: true,
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const body = req.body

    let variable: Variable

    if (body.id) variable = await Variable.findOne({ where: { id: body.id } })
    else variable = await Variable.create(body)

    if (body.id) {
      await variable.update({
        name: body.name,
        enabled: body.enabled,
        response: body.response
      })
    }
    await variables.init()
    res.json(variable)
  } catch (e) {
    next(e)
  }
})

router.delete('/', isAdmin, checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  }
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    await Variable.destroy({ where: { id: req.body.id }})
    await variables.init()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
