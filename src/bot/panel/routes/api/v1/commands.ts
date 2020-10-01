import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { Command } from '@bot/entities/Command'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import Commands from '@bot/systems/commands'
import customcommands from '@bot/systems/customcommands'
import cache from '@bot/libs/cache'
import { RequestContext, wrap } from '@mikro-orm/core'

const router = Router({
  mergeParams: true,
})

router.get('/', async (req, res, next) => {
  try {
    const commands = Commands.getCommands().map(c => {
      delete c.system
      return c
    })

    res.json(commands)
  } catch (e) {
    next(e)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const command = await RequestContext.getEntityManager().getRepository(Command).findOne(Number(req.params.id))

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
    in: ['body'],
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
    optional: true,
  },
  permission: {
    isString: true,
    in: ['body'],
    optional: true,
  },
  price: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
  sound_file: {
    isNumeric: true,
    in: ['body'],
    optional: {
      options: {
        nullable: true,
        checkFalsy: false,
      },
    },
  },
  sound_volume: {
    isNumeric: true,
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    const body = req.body
    const names: string[] = Commands.getCommands()
      .filter(c => c.id !== body.id)
      .reduce((array, command) => ([
        ...array,
        command.name,
        ...command.aliases ?? [],
      ]), [])
      .filter(Boolean)

    if (names.includes(body.name) || names.some(name => body.aliases?.includes(name))) {
      return res.status(400).send({ message: 'This aliase or name already exists.' })
    }
    
    const repository = RequestContext.getEntityManager().getRepository(Command)

    const command = body.id ? await repository.findOne({ id: body.id }) : repository.create(Command)
 
    repository.assign(command, body)
    await repository.persistAndFlush(command)

    await customcommands.init()
    cache.updateCommands()
    res.json(command)
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
    const repository = RequestContext.getEntityManager().getRepository(Command)
    const command = await repository.findOne({ id: req.body.id })
    await repository.removeAndFlush(command)

    await customcommands.init()
    cache.updateCommands()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
