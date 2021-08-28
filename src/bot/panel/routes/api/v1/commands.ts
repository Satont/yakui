import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import Commands from '@bot/systems/commands';
import customcommands from '@bot/systems/customcommands';
import cache from '@bot/libs/cache';
import { cloneDeep } from 'lodash';
import { prisma } from '@bot/libs/db';
import { Commands as CommandsType } from '@prisma/client';

const router = Router({
  mergeParams: true,
});

router.get('/', async (req, res, next) => {
  try {
    const commands = cloneDeep(Commands.getCommands()).map((command) => {
      delete command.system;
      return command;
    });

    res.json(commands);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', isAdmin, async (req, res, next) => {
  try {
    const command = await prisma.commands.findFirst({ where: { id: Number(req.params.id) } });
    res.json(command);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  isAdmin,
  checkSchema({
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
      optional: {
        options: {
          nullable: true,
          checkFalsy: false,
        },
      },
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();

      const body = req.body;

      const names: string[] = Commands.getCommands()
        .filter((c) => c.id !== body.id)
        .reduce((array, command) => [...array, command.name, ...(command.aliases ?? [])], [])
        .filter(Boolean);

      if (names.includes(body.name) || names.some((name) => body.aliases?.includes(name))) {
        return res.status(400).send({ message: 'This aliase or name already exists.' });
      }

      let command: CommandsType;

      if (!body.id) {
        command = await prisma.commands.create({
          data: body,
        });
      } else {
        command = await prisma.commands.update({
          where: {
            id: body.id,
          },
          data: body,
        });
      }

      await customcommands.init();
      await cache.updateCommands();
      res.json(command);
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  '/',
  isAdmin,
  checkSchema({
    id: {
      isNumeric: true,
      in: ['body'],
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validationResult(req).throw();
      await prisma.commands.delete({ where: { id: Number(req.body.id) } });
      await customcommands.init();
      cache.updateCommands();
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
