import { Router, Request, Response, NextFunction } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import isAdmin from '@bot/panel/middlewares/isAdmin';
import cache from '@bot/libs/cache';
import { prisma } from '@bot/libs/db';

const router = Router({
  mergeParams: true,
});

router.get('/', async (req, res, next) => {
  try {
    res.json([...cache.greetings.values()]);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', isAdmin, async (req, res, next) => {
  const greeting = cache.greetings.get(req.params.id);
  greeting.sound_file = (greeting.sound_file_id as any) ?? null;

  try {
    res.json(greeting);
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
    username: {
      in: ['body'],
      optional: true,
    },
    userId: {
      in: ['body'],
      optional: true,
    },
    message: {
      isString: true,
      in: ['body'],
    },
    enabled: {
      isBoolean: true,
      in: ['body'],
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

      const greeting = await prisma.greetings.upsert({
        where: { id: Number(body.id) },
        update: {
          ...body,
        },
        create: body,
      });

      await cache.updateGreetings();
      res.json(greeting);
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
      await prisma.greetings.delete({ where: { id: Number(req.body.id) } });

      await cache.updateGreetings();
      res.send('Ok');
    } catch (e) {
      next(e);
    }
  },
);

export default router;
