import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Command from '@bot/models/Command'
import { Command as CommandType } from 'typings'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import CommandUsage from '@bot/models/CommandUsage'
import Commands from '@bot/systems/commands'
import customcommands from '@bot/systems/customcommands'

const router = Router({
  mergeParams: true
})

router.get('/', async (req, res, next) => {
  try {
    const commands = await Commands.getCommands()

    res.json(commands)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const command: Command = await Command.findOne({ where: { id: req.params.id }})

    res.json(command)
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
  visible: {
    isBoolean: true,
    in: ['body'],
    optional: true,
  },
  description: {
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
  response: {
    isString: true,
    in: ['body'],
    optional: true
  },
  permission: {
    isString: true,
    in: ['body'],
    optional: true
  },
  price: {
    isNumeric: true,
    in: ['body'],
    optional: true
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

    let command: Command

    if (body.id) {
      command = await Command.findOne({ where: { id: body.id } })

      if (command.name !== body.name) {
        CommandUsage.findAll({ where: { name: command.name } }).then((usages: CommandUsage[]) => {
          for (const usage of usages) usage.update({ name: body.name })
        })
      }

      await command.update({
        name: body.name,
        aliases: body.aliases,
        cooldown: body.cooldown,
        description: body.description,
        visible: body.visible,
        permission: body.permission,
        response: body.response,
        price: body.price,
      })
    }
    else command = await Command.create(body)
    await customcommands.init()
    res.json(command)
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
    await Command.destroy({ where: { id: req.body.id }})
    await customcommands.init()

    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
