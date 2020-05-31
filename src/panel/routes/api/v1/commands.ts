import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Command from '../../../../models/Command'
import { Command as CommandType } from '../../../../typings/index'

const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const commands: Command[] = await Command.findAll()

    res.json(commands)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const command: Command[] = await Command.findOne({ where: { id: req.params.id }})

    res.json(command)
  } catch (e) {
    next(e)
  }
})

router.put('/', checkSchema({
  name: {
    isString: true,
    in: ['body'],
  },
  visible: {
    isBoolean: true,
    in: ['body'],
    optional: true,
  },
  description: {
    isString: true,
    in: ['body'],
    optional: true,
  },
  aliases: {
    isArray: true,
    in: ['body'],
    optional: true,
  },
  cooldown: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const names: string[] = []
    const body: CommandType = req.body

    for (const command of await Command.findAll()) {
      names.push(command.name)
      names.push(...command.aliases)
    }

    if (names.filter(Boolean).includes(body.name) || names.filter(Boolean).some(name => body.aliases?.includes(name))) {
      return res.status(400).send('This aliase or name already exists.')
    }

    const command: Command = await Command.create(body)

    res.json(command.toJSON())
  } catch (e) {
    next(e)
  }
})

router.patch('/', checkSchema({
  id: {
    isNumeric: true,
    in: ['body'],
  },
  name: {
    isString: true,
    in: ['body'],
    optional: true,
  },
  visible: {
    isBoolean: true,
    in: ['body'],
    optional: true,
  },
  description: {
    isString: true,
    in: ['body'],
    optional: true,
  },
  aliases: {
    isArray: true,
    in: ['body'],
    optional: true,
  },
  cooldown: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()
    const names: string[] = []
    const body: CommandType = req.body

    const commands = (await Command.findAll({ raw: true })).filter((c: CommandType) => c.id !== body.id)

    for (const command of commands) {
      names.push(command.name)
      names.push(...command.aliases)
    }

    if (names.filter(Boolean).includes(body.name) || names.filter(Boolean).some(name => body.aliases?.includes(name))) {
      return res.status(400).send('This aliase or name already exists.')
    }

    const command: Command = await Command.findOne({ where: { id: body.id }})

    await command.update({
      name: body.name,
      aliases: body.aliases,
      cooldown: body.cooldown,
      description: body.description,
      visible: body.visible,
    })

    res.json(command)
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

    await Command.destroy({ where: { id: req.body.id }})

    res.send('Ok')
  } catch (e) {
    next(e)
  }

})


export default router
