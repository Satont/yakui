import { Router, Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import Command from '@bot/models/Command'
import { Command as CommandType } from 'typings'
import isAdmin from '@bot/panel/middlewares/isAdmin'
import Commands from '@bot/systems/commands'
import customcommands from '@bot/systems/customcommands'
import CommandSound from '@bot/models/CommandSound'
import cache from '@bot/libs/cache'

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
    const command = Commands.getCommandById(req.params.id)

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
  sound: {
    in: ['body'],
    optional: true,
  },
}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw()

    const body: CommandType = req.body
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

    let command: Command

    if (body.id) {
      command = await Command.findOne({ where: { id: body.id } })

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
    } else command = await Command.create(body)

    if (body.sound?.soundId && body.sound?.soundId as any !== '0') {
      const [commandSound]: [CommandSound] = await CommandSound.findOrCreate({ 
        where: { commandId: command.id },
        defaults: { commandId: command.id, soundId: body.sound.soundId as any },
      })
      commandSound.soundId = body.sound.soundId as any
      commandSound.volume = body.sound.volume as any
      await commandSound.save()
    } else await CommandSound.destroy({ where: { commandId: command.id }}).catch(() => null)

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
    await Command.destroy({ where: { id: req.body.id }})
    await customcommands.init()
    
    cache.updateCommands()
    res.send('Ok')
  } catch (e) {
    next(e)
  }
})


export default router
