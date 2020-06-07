import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Variable from '@bot/models/Variable'

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

router.get('/:id', async (req, res, next) => {
  try {
    const variable: Variable[] = await Variable.findOne({ where: { id: req.params.id }})

    res.json(variable)
  } catch (e) {
    next(e)
  }
})

router.post('/', checkSchema({
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

    res.json(variable)
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
    await Variable.destroy({ where: { id: req.body.id }})

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
